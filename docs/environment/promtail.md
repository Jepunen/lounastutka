# Promtail

Promtail is the log collector for the Lounastutka monitoring stack. It discovers Docker containers, reads their logs, and pushes the log streams to Loki.

The project runs Promtail in the Swarm environments:

- local Swarm testing with `compose.local.swarm.yaml`
- production Swarm deployment with `compose.yaml`

Promtail is not part of the regular local development compose file.

## Role In The System

Promtail is responsible for:

- discovering Docker containers through the Docker socket
- reading Docker container log files
- adding labels to log streams
- tracking read positions
- pushing logs to Loki

Promtail does not provide the UI for logs. Logs are viewed in Grafana through the Loki data source.

## Service Configuration

Production uses the `grafana/promtail:latest` image:

```yaml
promtail:
  image: grafana/promtail:latest
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - /var/lib/docker/containers:/var/lib/docker/containers:ro
    - ./docker/promtail/config.yaml:/etc/promtail/config.yaml:ro
  command: -config.file=/etc/promtail/config.yaml
  networks:
    - monitoring
  deploy:
    mode: global
```

The config file is stored in the repository at:

```text
docker/promtail/config.yaml
```

Inside the container it is mounted at:

```text
/etc/promtail/config.yaml
```

## Deployment Mode

Promtail runs in global mode:

```yaml
deploy:
  mode: global
```

This starts one Promtail task on every Swarm node. That matters because Docker container logs are stored on the node where each container runs.

## Volumes

Promtail uses these mounts:

| Host path | Container path | Purpose |
|---|---|---|
| `/var/run/docker.sock` | `/var/run/docker.sock` | Discover Docker containers. |
| `/var/lib/docker/containers` | `/var/lib/docker/containers` | Read Docker container log files. |
| `./docker/promtail/config.yaml` | `/etc/promtail/config.yaml` | Load Promtail configuration. |

All mounts are read-only.

## Network Access

Promtail is connected to the `monitoring` network.

It pushes logs to Loki with the internal service URL:

```text
http://loki:3100/loki/api/v1/push
```

Loki must be reachable by service name on the same network.

## Promtail HTTP Server

Promtail exposes its own HTTP server on port `9080` inside the container:

```yaml
server:
  http_listen_port: 9080
```

This port is not exposed through Traefik and is not published on the host. It is only for Promtail's own internal HTTP endpoints.

## Positions File

Promtail tracks how far it has read in each log file with:

```yaml
positions:
  filename: /tmp/positions.yaml
```

The positions file is stored inside the Promtail container. Because it is not mounted to a persistent volume, a recreated Promtail task may reread some logs.

## Docker Discovery

Promtail discovers containers using Docker service discovery:

```yaml
scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
```

The refresh interval is `5s`, so Promtail notices new containers quickly.

## Labels

Promtail adds labels from Docker metadata:

| Label | Source |
|---|---|
| `container` | Docker container name |
| `streams` | Docker log stream |

The labels are configured with:

```yaml
relabel_configs:
  - source_labels: [__meta_docker_container_name]
    target_label: container
  - source_labels: [__meta_docker_container_log_stream]
    target_label: streams
```

These labels can be used in Grafana Explore with the Loki data source.

Example LogQL queries:

```logql
{container=~".*app.*"}
{streams="stdout"}
```

## Log Flow

The logging pipeline is:

```text
Docker containers -> Promtail -> Loki -> Grafana
```

Promtail pushes logs to Loki. Grafana queries Loki. Traefik is not involved in this internal log flow.

## Useful Commands

Show Promtail tasks:

```bash
docker service ps lounastutka_promtail
```

Follow Promtail logs:

```bash
docker service logs -f lounastutka_promtail
```

Inspect the Promtail service:

```bash
docker service inspect lounastutka_promtail
```

Show Loki logs:

```bash
docker service logs -f lounastutka_loki
```

List stack services:

```bash
docker stack services lounastutka
```

For local Swarm, deploy the stack:

```bash
docker stack deploy -c compose.local.swarm.yaml lounastutka
```

Then use Grafana Explore with the Loki data source:

```text
http://grafana.localhost
```

## Troubleshooting

### No Logs In Grafana

Check that:

- Promtail is running on each Swarm node
- Loki is running
- Grafana has the Loki data source provisioned
- Promtail and Loki share the `monitoring` network
- Grafana and Loki share the `monitoring` network

Useful commands:

```bash
docker service logs -f lounastutka_promtail
docker service logs -f lounastutka_loki
docker service logs -f lounastutka_grafana
```

### Promtail Cannot Read Docker Logs

Check that the required mounts exist:

```text
/var/run/docker.sock
/var/lib/docker/containers
```

Also check that both mounts are available on each Swarm node where Promtail runs.

### Promtail Cannot Push To Loki

Check that the client URL is:

```text
http://loki:3100/loki/api/v1/push
```

Then check that:

- the Loki service is running
- the `loki` service name resolves on the `monitoring` network
- Loki is listening on port `3100`
- Promtail is attached to the `monitoring` network

### Duplicate Logs After Restart

The positions file is currently stored at:

```text
/tmp/positions.yaml
```

Because this path is inside the Promtail container and is not backed by a volume, a recreated task can reread logs it has already shipped. Mount the positions file to persistent storage if duplicate logs after restarts become a problem.

# Loki

Loki is the log storage service for the Lounastutka monitoring stack. Promtail collects Docker container logs and pushes them to Loki, and Grafana queries Loki to show logs in the Grafana UI.

The project runs Loki in the Swarm environments:

- local Swarm testing with `compose.local.swarm.yaml`
- production Swarm deployment with `compose.yaml`

Loki is not part of the regular local development compose file.

## Role In The System

Loki is responsible for:

- receiving log streams from Promtail
- storing container logs
- exposing a query API for Grafana
- keeping logs internal to the monitoring network

Loki is not exposed through Traefik. Grafana is the browser-facing UI for reading logs.

## Service Configuration

Production uses the `grafana/loki:latest` image:

```yaml
loki:
  image: grafana/loki:latest
  expose:
    - "3100"
  command: -config.file=/etc/loki/local-config.yaml
  networks:
    - monitoring
```

The container listens internally on port `3100`.

The service uses Loki's built-in local configuration:

```text
/etc/loki/local-config.yaml
```

There is no project-specific Loki config file mounted at the moment.

## Network Access

Loki is connected only to the `monitoring` network.

| Service | Direction | URL |
|---|---|---|
| Promtail | Pushes logs to Loki | `http://loki:3100/loki/api/v1/push` |
| Grafana | Queries logs from Loki | `http://loki:3100` |

Because Loki is addressed by service name, Promtail and Grafana must also be connected to the `monitoring` network.

## Routes

Loki has no public route.

| Environment | Public URL |
|---|---|
| Production | None |
| Local Swarm | None |

To read logs, open Grafana instead:

| Environment | Grafana URL |
|---|---|
| Production | `https://grafana.lounastutka.fi` |
| Local Swarm | `http://grafana.localhost` |

## Log Flow

The logging pipeline is:

```text
Docker containers -> Promtail -> Loki -> Grafana
```

Promtail discovers Docker containers through the Docker socket:

```yaml
docker_sd_configs:
  - host: unix:///var/run/docker.sock
    refresh_interval: 5s
```

Promtail sends logs to Loki with:

```yaml
clients:
  - url: http://loki:3100/loki/api/v1/push
```

Grafana provisions Loki as a data source with:

```yaml
- name: Loki
  type: loki
  access: proxy
  url: http://loki:3100
```

## Labels

Promtail currently adds these labels to log streams:

| Label | Source |
|---|---|
| `container` | Docker container name |
| `streams` | Docker log stream |

The labels are configured in `docker/promtail/config.yaml`:

```yaml
relabel_configs:
  - source_labels: [__meta_docker_container_name]
    target_label: container
  - source_labels: [__meta_docker_container_log_stream]
    target_label: streams
```

These labels can be used in Grafana Explore when querying Loki.

Example query:

```logql
{container=~".*app.*"}
```

## Placement

Loki runs as one replica on a Swarm manager node:

```yaml
deploy:
  replicas: 1
  placement:
    constraints:
      - node.role == manager
```

Promtail runs globally, so every Swarm node can ship logs to the single Loki service.

## Storage

The current compose files do not mount a named volume for Loki.

This means Loki uses the storage paths defined by the image's local configuration inside the container filesystem. If the Loki task is replaced, stored logs may be lost.

For longer retention or production durability, add an explicit Loki configuration file and mount persistent storage for Loki data.

## Useful Commands

Show the Loki service:

```bash
docker service ps lounastutka_loki
```

Follow Loki logs:

```bash
docker service logs -f lounastutka_loki
```

Inspect the Loki service:

```bash
docker service inspect lounastutka_loki
```

Show Promtail logs:

```bash
docker service logs -f lounastutka_promtail
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

- the Loki service is running
- the Promtail service is running on each node
- Grafana has the Loki data source provisioned
- Grafana and Loki share the `monitoring` network
- Promtail and Loki share the `monitoring` network

Useful commands:

```bash
docker service logs -f lounastutka_loki
docker service logs -f lounastutka_promtail
docker service logs -f lounastutka_grafana
```

### Promtail Cannot Push Logs

Check that Promtail is using the internal Loki URL:

```text
http://loki:3100/loki/api/v1/push
```

Also check that:

- the `loki` service name resolves on the `monitoring` network
- Loki is listening on port `3100`
- Promtail has the `monitoring` network attached

### Grafana Data Source Fails

Check the provisioned Loki data source:

```text
http://loki:3100
```

The URL should be the Docker service name, not a public hostname.

### Loki Logs Disappear After Restart

The current Loki service does not use a named Docker volume. If a task is recreated, logs stored in the container filesystem can disappear.

Add persistent Loki storage before relying on Loki for long-term log retention.

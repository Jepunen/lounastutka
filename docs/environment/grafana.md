# Grafana

Grafana is the visualization layer for the Lounastutka monitoring stack. It is used to view metrics from Prometheus and logs from Loki.

The project runs Grafana in the Swarm environments:

- local Swarm testing with `compose.local.swarm.yaml`
- production Swarm deployment with `compose.yaml`

Grafana is not part of the regular local development compose file.

## Role In The System

Grafana is responsible for:

- providing dashboards for application and infrastructure monitoring
- querying Prometheus for metrics
- querying Loki for logs
- giving one web UI for monitoring the deployed stack
- storing Grafana state in a named Docker volume

Grafana does not collect metrics or logs by itself. Prometheus scrapes metrics, Promtail ships logs to Loki, and Grafana reads from those services.

## Service Configuration

Production uses the `grafana/grafana:latest` image:

```yaml
grafana:
  image: grafana/grafana:latest
  expose:
    - "3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GF_ADMIN_PASSWORD}
  volumes:
    - grafana_data:/var/lib/grafana
    - ./docker/grafana/provisioning:/etc/grafana/provisioning:ro
```

The container listens internally on port `3000`. Traefik routes external traffic to that port.

## Routes

### Production

In production, Grafana is exposed through Traefik:

| Route | Router | Internal port |
|---|---|---:|
| `https://grafana.lounastutka.fi` | `grafana` | `3000` |

The production route uses HTTPS and the Let's Encrypt certificate resolver named `le`:

```yaml
- "traefik.http.routers.grafana.rule=Host(`grafana.lounastutka.fi`)"
- "traefik.http.routers.grafana.entrypoints=websecure"
- "traefik.http.routers.grafana.tls=true"
- "traefik.http.routers.grafana.tls.certresolver=le"
- "traefik.http.services.grafana.loadbalancer.server.port=3000"
```

### Local Swarm

Local Swarm exposes Grafana through Traefik without TLS:

| Route | Router | Internal port |
|---|---|---:|
| `http://grafana.localhost` | `grafana` | `3000` |

The local Swarm admin password defaults to `admin` if `GF_ADMIN_PASSWORD` is not set:

```yaml
GF_SECURITY_ADMIN_PASSWORD: ${GF_ADMIN_PASSWORD:-admin}
```

## Authentication

Grafana uses its built-in login screen.

The admin password is configured with:

```text
GF_ADMIN_PASSWORD
```

The compose files pass this value to Grafana as:

```text
GF_SECURITY_ADMIN_PASSWORD
```

Set `GF_ADMIN_PASSWORD` in the deployment environment before deploying production. The username is the Grafana default admin user unless it is changed in Grafana configuration.

## Provisioning

Grafana provisioning files are mounted read-only from:

```text
docker/grafana/provisioning
```

Inside the container they are available at:

```text
/etc/grafana/provisioning
```

The current provisioning config adds two data sources from `docker/grafana/provisioning/datasources/datasources.yaml`.

| Data source | Type | URL | Default |
|---|---|---|---|
| `Prometheus` | `prometheus` | `http://prometheus:9090` | Yes |
| `Loki` | `loki` | `http://loki:3100` | No |

Both data sources use proxy access, so Grafana connects to them from inside the Docker network.

## Networks

Grafana joins two Swarm networks:

| Network | Purpose |
|---|---|
| `monitoring` | Connects Grafana to Prometheus and Loki. |
| `traefik_proxy` | Allows Traefik to route browser traffic to Grafana. |

Prometheus and Loki are addressed by service name:

```text
http://prometheus:9090
http://loki:3100
```

Because those names resolve inside the `monitoring` network, Grafana must stay attached to that network.

## Storage

Grafana stores its database, plugins, and runtime state in:

```text
/var/lib/grafana
```

Production persists that directory in the named volume:

```text
grafana_data
```

Local Swarm uses:

```text
grafana_data_local_swarm
```

Removing this volume removes local Grafana state, including dashboards created through the UI.

## Dependencies

Grafana depends on:

```yaml
depends_on:
  - prometheus
  - loki
```

In Swarm mode, `depends_on` does not wait for the dependency services to be healthy. If Grafana starts before Prometheus or Loki is ready, the data sources may show connection errors briefly and recover after the services start.

## Useful Commands

Show the Grafana service:

```bash
docker service ps lounastutka_grafana
```

Follow Grafana logs:

```bash
docker service logs -f lounastutka_grafana
```

Inspect the service:

```bash
docker service inspect lounastutka_grafana
```

List monitoring services:

```bash
docker stack services lounastutka
```

For local Swarm, deploy the stack and open Grafana:

```bash
docker stack deploy -c compose.local.swarm.yaml lounastutka
```

Then visit:

```text
http://grafana.localhost
```

## Troubleshooting

### Grafana Route Returns 404

A Traefik 404 usually means the request did not match a router.

Check that:

- the hostname is `grafana.lounastutka.fi` in production
- the hostname is `grafana.localhost` in local Swarm
- the Grafana service has `traefik.enable=true`
- the router uses the correct entrypoint
- Swarm labels are under `deploy.labels`

### Grafana Route Returns Bad Gateway

A bad gateway means Traefik matched the route but could not reach Grafana.

Check that:

- the Grafana task is running
- Grafana and Traefik both use the `traefik_proxy` network
- the load balancer port is `3000`
- the Grafana container is listening on port `3000`

### Data Source Cannot Connect

If Prometheus or Loki shows as unavailable in Grafana, check that:

- Grafana is connected to the `monitoring` network
- the `prometheus` service is running on port `9090`
- the `loki` service is running on port `3100`
- the provisioning URLs use service names, not public hostnames

Useful log commands:

```bash
docker service logs -f lounastutka_grafana
docker service logs -f lounastutka_prometheus
docker service logs -f lounastutka_loki
```

### Admin Login Fails

Check the value of:

```text
GF_ADMIN_PASSWORD
```

If the password was changed after Grafana already initialized, the persisted Grafana database in `grafana_data` may still contain the old password. Reset the password through Grafana administration tools or remove the Grafana volume only if losing stored Grafana state is acceptable.

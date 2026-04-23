# Prometheus

Prometheus is the metrics collection and time-series storage service for the Lounastutka monitoring stack. Grafana uses Prometheus as the default metrics data source.

The project runs Prometheus in the Swarm environments:

- local Swarm testing with `compose.local.swarm.yaml`
- production Swarm deployment with `compose.yaml`

Prometheus is not part of the regular local development compose file.

## Role In The System

Prometheus is responsible for:

- scraping configured metrics targets
- storing metric samples in its time-series database
- exposing a query API for Grafana
- providing the Prometheus web UI for direct metric inspection

Grafana is the main visualization UI, but Prometheus can also be opened directly for debugging targets and PromQL queries.

## Service Configuration

Production uses the `prom/prometheus:latest` image:

```yaml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./docker/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    - prom_data:/prometheus
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.path=/prometheus'
    - '--web.console.libraries=/usr/share/prometheus/console_libraries'
    - '--web.console.templates=/usr/share/prometheus/consoles'
```

The config file is stored in the repository at:

```text
docker/prometheus/prometheus.yml
```

Inside the container it is mounted at:

```text
/etc/prometheus/prometheus.yml
```

## Routes

### Production

In production, Prometheus is exposed through Traefik:

| Route | Router | Internal port |
|---|---|---:|
| `https://prometheus.swarm.lounastutka.fi` | `prometheus` | `9090` |

The production route uses HTTPS, Let's Encrypt, and basic authentication:

```yaml
- "traefik.http.routers.prometheus.rule=Host(`prometheus.swarm.lounastutka.fi`)"
- "traefik.http.routers.prometheus.entrypoints=websecure"
- "traefik.http.routers.prometheus.tls=true"
- "traefik.http.routers.prometheus.tls.certresolver=le"
- "traefik.http.routers.prometheus.middlewares=prometheus-auth@swarm"
- "traefik.http.services.prometheus.loadbalancer.server.port=9090"
```

The basic-auth middleware is configured in the production compose labels:

```yaml
- "traefik.http.middlewares.prometheus-auth.basicauth.users=admin:$$apr1$$zcBUgvAR$$482EWeJ0xk2wquAJdYDNG/"
```

### Local Swarm

Local Swarm exposes Prometheus through Traefik without TLS:

| Route | Router | Internal port |
|---|---|---:|
| `http://prometheus.localhost` | `prometheus` | `9090` |

## Scrape Configuration

The global scrape and evaluation interval is `15s`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
```

The current active scrape target is Prometheus itself:

```yaml
scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
```

There is also a commented example for scraping the Bun backend application:

```yaml
# - job_name: 'bun_app'
#   static_configs:
#     - targets: ['app:3001']
```

Enable application scraping only after the target service exposes Prometheus-format metrics.

## Grafana Data Source

Grafana provisions Prometheus as the default data source from:

```text
docker/grafana/provisioning/datasources/datasources.yaml
```

The configured data source URL is:

```text
http://prometheus:9090
```

Grafana reaches Prometheus by service name on the Docker network.

## Networks

Prometheus joins three Swarm networks:

| Network | Purpose |
|---|---|
| `monitoring` | Connects Prometheus to Grafana and other monitoring services. |
| `backend` | Allows Prometheus to scrape backend services when metrics are enabled. |
| `traefik_proxy` | Allows Traefik to expose the Prometheus web UI. |

Prometheus must stay connected to `traefik_proxy` for the public route and to `monitoring` for Grafana access.

## Storage

Prometheus stores its time-series database at:

```text
/prometheus
```

Production persists this directory in the named volume:

```text
prom_data
```

Local Swarm uses:

```text
prom_data_local_swarm
```

Removing the volume removes historical Prometheus metrics.

## Placement

Prometheus runs as one replica on a Swarm manager node:

```yaml
deploy:
  replicas: 1
  placement:
    constraints:
      - node.role == manager
```

## Relationship To Traefik Metrics

Traefik has Prometheus metrics enabled in the Traefik service configuration:

```text
--metrics.prometheus=true
```

In production, Traefik serves metrics on its internal metrics entrypoint:

```text
--metrics.prometheus.entrypoint=metrics
--entrypoints.metrics.address=:8082
```

The current Prometheus configuration does not yet scrape Traefik. Add a scrape job for the Traefik metrics endpoint when Traefik metrics should be stored in Prometheus.

## Useful Commands

Show the Prometheus service:

```bash
docker service ps lounastutka_prometheus
```

Follow Prometheus logs:

```bash
docker service logs -f lounastutka_prometheus
```

Inspect the Prometheus service:

```bash
docker service inspect lounastutka_prometheus
```

List stack services:

```bash
docker stack services lounastutka
```

For local Swarm, deploy the stack:

```bash
docker stack deploy -c compose.local.swarm.yaml lounastutka
```

Then open:

```text
http://prometheus.localhost
```

## Troubleshooting

### Prometheus Route Returns 404

A Traefik 404 usually means the request did not match a router.

Check that:

- the hostname is `prometheus.swarm.lounastutka.fi` in production
- the hostname is `prometheus.localhost` in local Swarm
- the Prometheus service has `traefik.enable=true`
- the router uses the correct entrypoint
- Swarm labels are under `deploy.labels`

### Prometheus Route Returns Bad Gateway

A bad gateway means Traefik matched the route but could not reach Prometheus.

Check that:

- the Prometheus task is running
- Prometheus and Traefik both use the `traefik_proxy` network
- the load balancer port is `9090`
- Prometheus is listening on port `9090`

### Grafana Cannot Query Prometheus

Check that:

- Grafana and Prometheus share the `monitoring` network
- the Grafana data source URL is `http://prometheus:9090`
- the Prometheus service is running
- Prometheus is listening on port `9090`

Useful commands:

```bash
docker service logs -f lounastutka_grafana
docker service logs -f lounastutka_prometheus
```

### Target Is Down

Open the Prometheus targets page and check the target status:

```text
https://prometheus.swarm.lounastutka.fi/targets
```

For local Swarm:

```text
http://prometheus.localhost/targets
```

If a target is down, check:

- the target service is running
- the target service shares a network with Prometheus
- the target port is correct
- the target exposes Prometheus-format metrics

### Metrics Disappear After Removing Volumes

Prometheus stores metrics in the `prom_data` volume. If the volume is removed, historical metrics are deleted.

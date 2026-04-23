# Traefik

Traefik is the reverse proxy for Lounastutka. It receives HTTP and HTTPS traffic, discovers Docker services, and routes requests to the correct container based on hostnames and paths.

The project uses Traefik in three environments:

- local development with `compose.dev.yaml`
- local Swarm testing with `compose.local.swarm.yaml`
- production Swarm deployment with `compose.yaml`

## Role In The System

Traefik is responsible for:

- exposing the public entrypoints on ports `80` and `443`
- redirecting HTTP traffic to HTTPS in environments that use TLS
- terminating TLS certificates
- routing frontend requests to the frontend service
- routing API requests to the backend service
- routing scraper requests to the microservice
- exposing dashboards for Traefik and monitoring tools
- exporting access logs and Prometheus metrics

Services are not exposed automatically. They must opt in with Traefik labels.

## Configuration Style

Traefik configuration is split into two parts:

| Type | Location | Purpose |
|---|---|---|
| Static configuration | `command:` arguments on the `traefik` service | Entrypoints, providers, logging, metrics, certificate resolver. |
| Dynamic configuration | Docker or Swarm labels | Routers, services, middlewares, TLS flags, host rules. |

Local development also mounts:

```text
dynamic/tls.yaml
certs/
```

This provides a local certificate for HTTPS development.

## Entrypoints

### Production

Production Traefik exposes:

| Entrypoint | Port | Purpose |
|---|---:|---|
| `web` | `80` | HTTP entrypoint. Redirects to HTTPS. |
| `websecure` | `443` | HTTPS entrypoint for application traffic. |
| `metrics` | `8082` | Internal Prometheus metrics entrypoint. |

The production stack publishes ports `80` and `443` in host mode:

```yaml
ports:
  - target: 80
    published: 80
    mode: host
  - target: 443
    published: 443
    mode: host
```

HTTP is redirected permanently to HTTPS:

```text
--entrypoints.web.http.redirections.entrypoint.to=websecure
--entrypoints.web.http.redirections.entrypoint.scheme=https
--entrypoints.web.http.redirections.entrypoint.permanent=true
```

### Local Swarm

Local Swarm exposes:

| Entrypoint | Port | Purpose |
|---|---:|---|
| `web` | `80` | Local HTTP routes. |
| `traefik` | `8080` | Dashboard and metrics entrypoint. |

Local Swarm does not configure TLS. It is intended for testing the Swarm routing shape locally.

### Local Development

Local development exposes:

| Entrypoint | Port | Purpose |
|---|---:|---|
| `web` | `80` | HTTP entrypoint. Redirects to HTTPS. |
| `websecure` | `443` | HTTPS entrypoint using local certificates. |

The development setup uses `dynamic/tls.yaml`:

```yaml
tls:
  certificates:
    - certFile: /certs/local.crt
      keyFile:  /certs/local.key
```

The certificate and key are mounted from:

```text
certs/local.crt
certs/local.key
```

## Providers

### Production And Local Swarm

Production and local Swarm use the Docker Swarm provider:

```text
--providers.swarm.endpoint=unix:///var/run/docker.sock
--providers.swarm.watch=true
--providers.swarm.exposedbydefault=false
--providers.swarm.network=lounastutka_traefik_proxy
```

The Docker socket is mounted read-only:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

Traefik must run on a manager node because it reads Swarm service metadata through the Docker socket.

### Local Development

Local development uses the Docker provider:

```text
--providers.docker=true
--providers.docker.exposedbydefault=false
--providers.docker.network=proxy
```

The development network is named:

```text
proxy
```

## Networks

In Swarm, public services that Traefik routes to must be connected to:

```text
traefik_proxy
```

The fully qualified Swarm network name is:

```text
lounastutka_traefik_proxy
```

Traefik also connects to the `monitoring` network so Prometheus can reach metrics.

Services that are internal only, such as PostgreSQL and Loki, do not need Traefik labels.

## Production Routes

Production routing is defined by labels in `compose.yaml`.

| Route | Router | Target service | Internal port |
|---|---|---|---:|
| `https://lounastutka.fi` | `frontend` | `frontend` | `80` |
| `https://lounastutka.fi/api` | `api` | `app` | `3001` |
| `https://lounastutka.fi/scrape` | `microservice` | `microservice` | `8100` |
| `https://dashboard.swarm.lounastutka.fi` | `dashboard` | `api@internal` | internal |
| `https://whoami.swarm.lounastutka.fi` | `whoami` | `whoami` | `80` |
| `https://prometheus.swarm.lounastutka.fi` | `prometheus` | `prometheus` | `9090` |
| `https://grafana.lounastutka.fi` | `grafana` | `grafana` | `3000` |
| `https://portainer.lounastutka.fi` | `portainer` | `portainer` | `9000` |

The API router uses a path prefix:

```text
Host(`lounastutka.fi`) && PathPrefix(`/api`)
```

The scraper microservice router also uses a path prefix:

```text
Host(`lounastutka.fi`) && PathPrefix(`/scrape`)
```

The frontend router matches the root host:

```text
Host(`lounastutka.fi`)
```

## Local Swarm Routes

Local Swarm routes are defined in `compose.local.swarm.yaml`.

| Route | Target service | Internal port |
|---|---|---:|
| `http://localhost` | `frontend` | `80` |
| `http://localhost/api` | `app` | `3001` |
| `http://localhost/scrape` | `microservice` | `8100` |
| `http://dashboard.localhost` | Traefik dashboard | `8080` |
| `http://whoami.localhost` | `whoami` | `80` |
| `http://prometheus.localhost` | `prometheus` | `9090` |
| `http://grafana.localhost` | `grafana` | `3000` |
| `http://portainer.localhost` | `portainer` | `9000` |

## Local Development Routes

Local development routes are defined in `compose.dev.yaml`.

| Route | Target service |
|---|---|
| `https://localhost` | `frontend` |
| `https://localhost/api` | `backend` |
| `https://dashboard.docker.localhost` | Traefik dashboard |
| `https://whoami.docker.localhost` | `whoami` |

The frontend and backend also publish direct development ports:

| Service | Direct URL |
|---|---|
| Frontend Vite dev server | `http://localhost:5173` |
| Backend API | `http://localhost:3001` |

These direct ports are useful during development, while the Traefik routes are useful for testing proxy behavior.

## Labels

A routed service needs these labels:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.<router-name>.rule=Host(`<host>`)"
  - "traefik.http.routers.<router-name>.entrypoints=<entrypoint>"
  - "traefik.http.services.<service-name>.loadbalancer.server.port=<internal-port>"
```

Production HTTPS routes also include:

```yaml
  - "traefik.http.routers.<router-name>.tls=true"
  - "traefik.http.routers.<router-name>.tls.certresolver=le"
```

In Swarm mode, labels belong under `deploy.labels`, not top-level service `labels`.

## TLS Certificates

### Production Certificates

Production uses Let's Encrypt certificates through Traefik's ACME DNS challenge.

The certificate resolver is named:

```text
le
```

The production resolver uses Hetzner DNS:

```text
--certificatesresolvers.le.acme.dnschallenge=true
--certificatesresolvers.le.acme.dnschallenge.provider=hetzner
```

The Hetzner API token is passed to the Traefik container as:

```text
HETZNER_API_TOKEN
```

Certificate state is stored in:

```text
/letsencrypt/acme.json
```

On the host this is mounted from:

```text
/opt/lounastutka/letsencrypt/acme.json
```

The GitHub Actions deployment creates this file before deploying:

```bash
mkdir -p /opt/lounastutka/letsencrypt
touch /opt/lounastutka/letsencrypt/acme.json
chmod 600 /opt/lounastutka/letsencrypt/acme.json
```

### Local Development Certificates

Local development uses the file provider and local certificate files:

```text
--providers.file.filename=/dynamic/tls.yaml
```

The local certificate files are:

```text
certs/local.crt
certs/local.key
```

Browsers may show a warning unless the local certificate is trusted by the operating system.

## Dashboard

The Traefik dashboard is enabled in all environments:

```text
--api.dashboard=true
--api.insecure=false
```

Because insecure mode is disabled, the dashboard is exposed through a normal Traefik router using:

```text
api@internal
```

Dashboard routes:

| Environment | URL |
|---|---|
| Production | `https://dashboard.swarm.lounastutka.fi` |
| Local Swarm | `http://dashboard.localhost` |
| Local development | `https://dashboard.docker.localhost` |

Production and local development protect the dashboard with basic authentication.

## Middlewares

The current configuration defines basic-auth middlewares for protected dashboards.

| Middleware | Environment | Used by |
|---|---|---|
| `dashboard-auth@swarm` | Production Swarm | Traefik dashboard |
| `prometheus-auth@swarm` | Production Swarm | Prometheus |
| `dashboard-auth@docker` | Local development | Traefik dashboard |

The password hashes are stored in compose labels. In YAML, dollar signs are escaped as `$$`.

## Logging And Metrics

Traefik access logs are enabled:

```text
--accesslog=true
```

Traefik Prometheus metrics are enabled:

```text
--metrics.prometheus=true
```

In production, metrics are served on the internal `metrics` entrypoint:

```text
--metrics.prometheus.entrypoint=metrics
--entrypoints.metrics.address=:8082
```

Local Swarm attaches metrics to the `traefik` entrypoint on port `8080`.

## Useful Commands

Show the Traefik service:

```bash
docker service ps lounastutka_traefik
```

Follow Traefik logs:

```bash
docker service logs -f lounastutka_traefik
```

Inspect the production Traefik service:

```bash
docker service inspect lounastutka_traefik
```

List stack services:

```bash
docker stack services lounastutka
```

For local development logs:

```bash
docker compose -f compose.dev.yaml logs -f traefik
```

## Adding A New Routed Service

To expose a new service through Traefik:

1. Connect the service to the Traefik network.
2. Add `traefik.enable=true`.
3. Add a router rule with `Host(...)` and, if needed, `PathPrefix(...)`.
4. Set the router entrypoint.
5. Set TLS labels for production HTTPS routes.
6. Set the load balancer port to the container's internal port.

Example Swarm labels:

```yaml
deploy:
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.example.rule=Host(`lounastutka.fi`) && PathPrefix(`/example`)"
    - "traefik.http.routers.example.entrypoints=websecure"
    - "traefik.http.routers.example.tls=true"
    - "traefik.http.routers.example.tls.certresolver=le"
    - "traefik.http.services.example.loadbalancer.server.port=8080"
```

## Troubleshooting

### Service Is Not Visible In Traefik

Check that:

- the service has `traefik.enable=true`
- Swarm labels are under `deploy.labels`
- the service is connected to `traefik_proxy`
- Traefik is using `lounastutka_traefik_proxy`
- the service has at least one running task

### Route Returns 404

A Traefik 404 usually means no router matched the request.

Check:

- the hostname in the router rule
- the path prefix in the router rule
- whether the request is using HTTP or HTTPS
- whether the router is attached to the correct entrypoint

### Route Returns Bad Gateway

A bad gateway usually means Traefik matched the router but could not reach the target service.

Check:

- the target service is running
- the internal load balancer port is correct
- the service and Traefik share a network
- the application is listening on `0.0.0.0`, not only `localhost`

### TLS Certificate Is Not Created

Check that:

- `HETZNER_API_TOKEN` is set
- DNS records point to the production server
- `/opt/lounastutka/letsencrypt/acme.json` exists
- `acme.json` has permission mode `600`
- Traefik can write to the mounted `letsencrypt` directory

Then inspect Traefik logs:

```bash
docker service logs -f lounastutka_traefik
```

### Dashboard Requires Login

The production and development dashboards use basic authentication. The credentials are configured in Traefik middleware labels in the compose files.

If login fails, update the basic-auth hash in the relevant compose file and redeploy the stack.

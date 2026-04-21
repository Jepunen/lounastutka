# Docker

Lounastutka is designed to run as containers in both development and deployment environments. Docker is used for three main workflows:

- local development with `compose.dev.yaml`
- local production-style testing with `compose.local.swarm.yaml`
- production deployment with Docker Swarm using `compose.yaml`

The Docker setup keeps the application services, database, reverse proxy, and observability tools reproducible across machines.

## Docker Files

| File | Purpose |
|---|---|
| `compose.dev.yaml` | Local development environment with live reload. |
| `compose.local.swarm.yaml` | Local single-node Swarm environment using locally built images. |
| `compose.yaml` | Production Swarm stack deployed by GitHub Actions. |
| `Backend/Dockerfile` | Builds the Bun backend into a compiled runtime binary. |
| `Frontend/Dockerfile` | Builds the frontend and serves it with Nginx. |
| `microservice/Dockerfile` | Runs the Python scraper microservice with Uvicorn. |

## Services

The production stack contains these services:

| Service | Description |
|---|---|
| `traefik` | Edge reverse proxy, HTTPS entrypoint, routing, TLS certificates, and dashboard. |
| `frontend` | Static frontend served through Nginx. |
| `app` | Backend API service listening internally on port `3001`. |
| `microservice` | Python scraping service listening internally on port `8100`. |
| `db` | PostgreSQL database. |
| `prometheus` | Metrics collection. |
| `loki` | Log storage. |
| `promtail` | Docker log collector for Loki. |
| `grafana` | Observability dashboard. |
| `portainer` | Docker Swarm management UI. |
| `whoami` | Small Traefik test service. |

The local development stack is smaller and starts only Traefik, frontend, backend, database, and `whoami`.

## Local Development

Use the development compose file when actively writing code. It mounts the local source folders into containers and runs the frontend and backend in watch mode.

Start the development environment from the repository root:

```bash
docker compose -f compose.dev.yaml up
```

Development endpoints:

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:3001` |
| PostgreSQL | `localhost:5432` |
| Traefik dashboard | `https://dashboard.docker.localhost` |
| Whoami test service | `https://whoami.docker.localhost` |

The backend and frontend containers use the official `oven/bun:1` image in development. Dependencies are installed inside named Docker volumes:

- `backend_node_modules`
- `frontend_node_modules`

This avoids writing container-installed dependencies directly into the host working tree.

Stop the development environment:

```bash
docker compose -f compose.dev.yaml down
```

Stop and remove local development volumes:

```bash
docker compose -f compose.dev.yaml down -v
```

Removing volumes resets the local database and dependency volumes.

## Local Swarm

Use the local Swarm compose file when you want to test the production deployment shape without pushing images to GitHub Container Registry.

Build the local images:

```bash
docker build -t lounastutka-backend:local ./Backend
docker build -t lounastutka-frontend:local ./Frontend
docker build -t lounastutka-microservice:local ./microservice
```

Initialize Swarm once:

```bash
docker swarm init
```

Deploy the local stack:

```bash
docker stack deploy -c compose.local.swarm.yaml lounastutka
```

Local Swarm endpoints:

| Service | URL |
|---|---|
| Frontend | `http://localhost` |
| API | `http://localhost/api` |
| Scraper microservice | `http://localhost/scrape` |
| Traefik dashboard | `http://dashboard.localhost` |
| Grafana | `http://grafana.localhost` |
| Prometheus | `http://prometheus.localhost` |
| Portainer | `http://portainer.localhost` |
| Whoami test service | `http://whoami.localhost` |

Inspect the running stack:

```bash
docker stack services lounastutka
docker service ps lounastutka_app
docker service ps lounastutka_frontend
docker service ps lounastutka_microservice
```

Remove the local Swarm stack:

```bash
docker stack rm lounastutka
```

## Production Swarm

Production uses `compose.yaml` and is deployed as a Docker Swarm stack named `lounastutka`.

Images are built by GitHub Actions and pushed to GitHub Container Registry:

- `ghcr.io/<owner>/<repo>/backend:<tag>`
- `ghcr.io/<owner>/<repo>/frontend:<tag>`
- `ghcr.io/<owner>/<repo>/microservice:<tag>`

Each image is tagged with:

- `latest`
- the Git commit SHA

The deployment workflow copies the stack configuration to `/opt/lounastutka` on the server and runs:

```bash
docker stack deploy -c compose.yaml lounastutka --with-registry-auth
```

The following environment variables are passed during deployment:

| Variable | Purpose |
|---|---|
| `IMAGE_TAG` | Image tag to deploy, normally the Git commit SHA. |
| `GITHUB_REPOSITORY` | Repository path used to resolve GHCR image names. |
| `POSTGRES_PASSWORD` | PostgreSQL password. |
| `POSTGRES_URL` | Backend database connection string. |
| `JWT_SECRET` | Backend JWT signing secret. |
| `JWT_EXPIRES_IN` | JWT expiry duration, defaults to `1d`. |
| `WEBAUTHN_RP_ID` | WebAuthn relying party ID. |
| `WEBAUTHN_RP_NAME` | WebAuthn relying party display name. |
| `WEBAUTHN_ORIGIN` | Allowed WebAuthn origin. |
| `HETZNER_API_TOKEN` | Hetzner DNS token used by Traefik for ACME DNS challenge. |
| `GF_ADMIN_PASSWORD` | Grafana admin password. |

Production routes are handled by Traefik:

| Route | Service |
|---|---|
| `https://lounastutka.fi` | Frontend |
| `https://lounastutka.fi/api` | Backend API |
| `https://lounastutka.fi/scrape` | Scraper microservice |
| `https://dashboard.swarm.lounastutka.fi` | Traefik dashboard |
| `https://grafana.lounastutka.fi` | Grafana |
| `https://prometheus.swarm.lounastutka.fi` | Prometheus |
| `https://portainer.lounastutka.fi` | Portainer |
| `https://whoami.swarm.lounastutka.fi` | Traefik test service |

## Images

### Backend

`Backend/Dockerfile` uses a multi-stage build:

1. installs dependencies with Bun
2. compiles `index.ts` into a standalone binary
3. copies the binary into a minimal Debian runtime image

The final container exposes port `3001`.

### Frontend

`Frontend/Dockerfile` uses a multi-stage build:

1. installs frontend dependencies with npm
2. builds the application
3. copies the built client files into an Nginx image

Nginx uses `Frontend/docker/nginx/default.conf` and serves the frontend on port `80`.

### Microservice

`microservice/Dockerfile` uses Python `3.11-slim`, installs dependencies with `uv`, and starts Uvicorn:

```bash
uvicorn scraper:app --host 0.0.0.0 --port 8100
```

The final container exposes the application internally on port `8100`.

## Networks

The Swarm stack uses overlay networks:

| Network | Purpose |
|---|---|
| `traefik_proxy` | Public application routing through Traefik. |
| `backend` | Internal application and database communication. |
| `monitoring` | Prometheus, Loki, Promtail, Grafana, and Traefik metrics. |
| `edge` | Portainer and Portainer agent communication. |

The development compose file uses a local Docker network named `proxy`.

## Volumes

Important production volumes:

| Volume | Purpose |
|---|---|
| `pg_data` | PostgreSQL data. |
| `prom_data` | Prometheus data. |
| `grafana_data` | Grafana data. |
| `portainer_data` | Portainer data. |
| `./letsencrypt` | Traefik ACME certificate storage. |
| `./Database/init` | SQL initialization scripts mounted into PostgreSQL. |
| `./docker/grafana/provisioning` | Grafana datasource and dashboard provisioning. |
| `./docker/prometheus/prometheus.yml` | Prometheus configuration. |
| `./docker/promtail/config.yaml` | Promtail configuration. |

PostgreSQL, Grafana, Prometheus, and Portainer store persistent data in Docker volumes. Removing these volumes deletes their stored state.

## Useful Commands

Show local compose containers:

```bash
docker compose -f compose.dev.yaml ps
```

Follow local development logs:

```bash
docker compose -f compose.dev.yaml logs -f
```

Show Swarm services:

```bash
docker stack services lounastutka
```

Show tasks for a service:

```bash
docker service ps lounastutka_app
```

Follow Swarm service logs:

```bash
docker service logs -f lounastutka_app
docker service logs -f lounastutka_frontend
docker service logs -f lounastutka_microservice
docker service logs -f lounastutka_traefik
```

Remove the Swarm stack:

```bash
docker stack rm lounastutka
```

Leave Swarm mode:

```bash
docker swarm leave --force
```

## Troubleshooting

### Port Already in Use

Local development binds ports `80`, `443`, `3001`, `5173`, and `5432`. Stop the conflicting local process or edit the port mapping in `compose.dev.yaml`.

### Database Does Not Initialize Again

PostgreSQL only runs scripts from `Database/init` when the data directory is empty. To recreate the local development database:

```bash
docker compose -f compose.dev.yaml down -v
docker compose -f compose.dev.yaml up
```

### Swarm Service Does Not Update

Check which image tag is deployed:

```bash
docker service inspect lounastutka_app --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}'
```

Then inspect service tasks and logs:

```bash
docker service ps lounastutka_app
docker service logs -f lounastutka_app
```

### Traefik Cannot Route to a Service

Check that the service has:

- `traefik.enable=true`
- a router rule
- the correct Traefik entrypoint
- the correct internal service port
- membership in the `traefik_proxy` network

In production Swarm, Traefik is configured to use the `lounastutka_traefik_proxy` network.

### TLS Certificate Issues

Production certificates are managed by Traefik using the Hetzner DNS challenge. Verify that:

- `HETZNER_API_TOKEN` is set
- `/opt/lounastutka/letsencrypt/acme.json` exists
- `acme.json` has permission mode `600`
- DNS records point to the Swarm host

The GitHub Actions deploy step creates `letsencrypt/acme.json` automatically before deploying the stack.

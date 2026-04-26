# Installation

This guide reflects the current setup of the repository.

## Prerequisites

- Docker Engine
- Docker Compose plugin (`docker compose`)
- Optional for docs: Python and MkDocs

## Quick Start (Local Development)

Run from repository root:

```bash
docker compose -f compose.dev.yaml up
```

This starts:

- Frontend on `http://localhost:5173`
- Backend on `http://localhost:3001`
- PostgreSQL on `localhost:5432`

Stop services:

```bash
docker compose -f compose.dev.yaml down
```

Stop and remove volumes:

```bash
docker compose -f compose.dev.yaml down -v
```

## Production-Style Swarm Deployment

Initialize Swarm (once):

```bash
docker swarm init
```

Build images:

```bash
docker build -t lounastutka-backend:latest ./Backend
docker build -t lounastutka-frontend:latest ./Frontend
```

Deploy stack:

```bash
docker stack deploy -c compose.yaml lounastutka
```

Useful checks:

```bash
docker stack services lounastutka
docker service ps lounastutka_app
docker service ps lounastutka_frontend
```

Swarm endpoints:

- App (via Traefik): `http://localhost`
- Traefik dashboard: `http://localhost:8080`
- Grafana: `http://localhost:3000`

Remove stack:

```bash
docker stack rm lounastutka
```

## Notes

- In local development, frontend and backend source folders are bind-mounted into containers.
- Prometheus and Loki are included in Swarm mode and are internal by default.
- For real production, move credentials from Compose files into a secret manager.



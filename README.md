# Lounastutka

Lounastutka is a containerized full-stack application.

- Frontend: React Router app in Frontend
- Backend: Bun service in Backend
- Database: PostgreSQL

The repository supports two ways to run the app:

- Local development with Docker Compose
- Local Docker Swarm deployment
- Production-style deployment with Docker Swarm and Traefik

## Quick Start

Run locally from repository root:

```bash
docker compose -f compose.dev.yaml up
```

Available endpoints:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432

Stop local services:

```bash
docker compose -f compose.dev.yaml down
```

Remove local volumes too:

```bash
docker compose -f compose.dev.yaml down -v
```

## Swarm Deployment

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

Main Swarm endpoints:

- App via Traefik: http://localhost
- Traefik dashboard: http://localhost:8080
- Grafana: http://localhost:3000

## Local Swarm Deployment

Build local images:

```bash
docker build -t lounastutka-backend:local ./Backend
docker build -t lounastutka-frontend:local ./Frontend
```

Initialize Swarm if needed:

```bash
docker swarm init
```

Deploy the local stack:

```bash
docker stack deploy -c compose.local.swarm.yaml lounastutka
```

Local endpoints:

- Frontend: http://localhost
- API: http://localhost/api
- Traefik dashboard: http://dashboard.localhost
- Whoami: http://whoami.localhost
- Grafana: http://grafana.localhost
- Prometheus: http://prometheus.localhost

## Documentation

Project docs are built with MkDocs.

Serve docs locally:

```bash
mkdocs serve
```

Build static docs:

```bash
mkdocs build
```

See also:

- docs/installation.md
- docker-instructions.md

# Lounastutka

Lounastutka is a containerized full-stack application.

- Frontend: React Router app in Frontend
- Backend: Bun service in Backend
- Database: PostgreSQL

The repository supports two ways to run the app:

- Local development with Docker Compose
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

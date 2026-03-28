# Lounastutka

Lounastutka is a containerized full-stack app with:

- Frontend: React Router app
- Backend: Bun HTTP service
- Database: PostgreSQL

The repository includes two deployment modes:

- Local development with Docker Compose
- Production-style Docker Swarm stack with Traefik and monitoring services

## Services Overview

Development (`compose.dev.yaml`):

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

Swarm (`compose.yaml`):

- Traefik edge router: `http://localhost`
- Traefik dashboard: `http://localhost:8080`
- Grafana: `http://localhost:3000`
- Prometheus and Loki are internal by default

## Documentation Map

- Installation and run instructions: [Installation](installation.md)
- Frontend module notes: [Frontend](frontend/index.md)
- Backend module notes: [Backend](backend/index.md)

## Build Documentation

From repository root:

```bash
mkdocs build
```

Serve locally with live reload:

```bash
mkdocs serve
```

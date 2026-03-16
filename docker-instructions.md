# Docker Instructions for Lounastutka

This repository now has two Docker entry points:

- `compose.yaml` for Docker Swarm deployment with `docker stack deploy`
- `compose.dev.yaml` for local development with `docker compose up`

## Swarm Deployment

The Swarm stack includes:

- **traefik**: edge router and load balancer
- **frontend**: React frontend served by Nginx
- **app**: Bun backend from `./Backend`
- **db**: PostgreSQL
- **prometheus**: metrics collection
- **loki**: log aggregation
- **grafana**: dashboards and log viewing

### 1. Initialize Swarm

Run this once on the manager node:

```bash
docker swarm init
```

If needed, specify the advertised interface explicitly:

```bash
docker swarm init --advertise-addr <IP_ADDRESS>
```

### 2. Deploy the Stack

Build the backend and frontend images from the repository root:

```bash
docker build -t lounastutka-backend:latest ./Backend
docker build -t lounastutka-frontend:latest ./Frontend
```

Then deploy the stack:

```bash
docker stack deploy -c compose.yaml lounastutka
```

### 3. Verify the Deployment

```bash
docker stack ls
docker stack services lounastutka
docker service ps lounastutka_app
docker service ps lounastutka_frontend
```

### 4. View Logs

```bash
docker service logs lounastutka_app -f
docker service logs lounastutka_frontend -f
docker service logs lounastutka_traefik -f
```

For longer-term monitoring, use Grafana and Loki rather than raw service logs.

### 5. Access the Services

- Application via Traefik: `http://localhost`
- Traefik dashboard: `http://localhost:8080`
- Grafana: `http://localhost:3000`
- Prometheus: internal-only by default
- Loki: internal-only by default

Default Grafana credentials are `admin` / `admin` unless changed.

### 6. Update the Stack

After changing `compose.yaml`, the backend image, the frontend image, or Docker config files, rebuild the affected images and redeploy:

```bash
docker build -t lounastutka-backend:latest ./Backend
docker build -t lounastutka-frontend:latest ./Frontend
```

```bash
docker stack deploy -c compose.yaml lounastutka
```

### 7. Remove the Stack

```bash
docker stack rm lounastutka
```

To leave Swarm mode entirely:

```bash
docker swarm leave --force
```

## Local Development

Use the development setup when you want a faster local loop without Swarm:

```bash
docker compose -f compose.dev.yaml up
```

This starts:

- `backend` on `http://localhost:3001`
- `frontend` on `http://localhost:5173`
- `db` on `localhost:5432`

The backend and frontend source directories are bind-mounted into the containers, so local file changes are reflected directly. Both containers run Bun commands in development mode.

To stop the local environment:

```bash
docker compose -f compose.dev.yaml down
```

To also remove local dev volumes:

```bash
docker compose -f compose.dev.yaml down -v
```

## Production Notes

1. **Image distribution**: In a real multi-node Swarm, locally built images are not automatically available on other nodes. Push images to a registry and update the `image:` references in `compose.yaml`.
2. **Secrets**: Do not keep production credentials directly in `compose.yaml`. Use Docker Secrets or another secret manager.
3. **Stateful services**: Volumes such as Postgres and Grafana storage are node-local unless backed by shared storage. Keep placement constraints in mind for multi-node deployments.
4. **HTTPS**: Traefik is now the edge router. For a real deployment, add TLS certificates or a Let's Encrypt resolver before exposing the stack publicly.

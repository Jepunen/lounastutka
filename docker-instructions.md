# Docker Instructions for Lounastutka

This repository has two Docker entry points:

- `compose.yaml` — Docker Swarm production deployment (deployed automatically via GitHub Actions)
- `compose.dev.yaml` — local development with `docker compose up`

## CI/CD — GitHub Actions (normal deployment flow)

Production deployments are fully automated. Pushing to `main`:

1. Builds the backend and frontend Docker images on GitHub's servers
2. Pushes them to GitHub Container Registry (`ghcr.io`)
3. SSHs into the Hetzner server and runs `docker stack deploy`

**You do not need to build or push images manually.** Just push to `main`.

### Required repository secrets

Set these under **Settings → Secrets → Actions** in the GitHub repository:

| Secret | Value |
|---|---|
| `HETZNER_HOST` | IP or hostname of the Hetzner server |
| `HETZNER_USER` | SSH user on the server (e.g. `root`) |
| `HETZNER_SSH_KEY` | Private SSH key (matching public key must be on the server) |
| `POSTGRES_PASSWORD` | Production database password |

`GITHUB_TOKEN` is provided automatically by GitHub — do not add it manually.

### One-time server setup

Run these once on the Hetzner server (as `root`):

```bash
# Install Docker
apt update && apt install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

# Create deploy user and give Docker access
useradd -m -s /bin/bash github
usermod -aG docker github
# Copy your SSH public key to /home/github/.ssh/authorized_keys

# Set up app directory
mkdir -p /opt/lounastutka
chown github:github /opt/lounastutka

# Initialize Docker Swarm
docker swarm init
```

The GitHub Actions deploy user is `github`. The `HETZNER_USER` secret should be set to `github`.

---

## Manual Swarm Deployment (advanced / emergency)

If you need to deploy manually without GitHub Actions, images must first exist in the registry.
Pull the images on the server and then deploy:

```bash
export IMAGE_TAG=<git-sha-or-latest>
export GITHUB_REPOSITORY=<owner>/<repo>
export POSTGRES_PASSWORD=<password>

echo "<ghcr-token>" | docker login ghcr.io -u <github-username> --password-stdin
docker stack deploy -c compose.yaml lounastutka --with-registry-auth
```

### Verify the deployment

```bash
docker stack ls
docker stack services lounastutka
docker service ps lounastutka_app
docker service ps lounastutka_frontend
```

### View logs

```bash
docker service logs lounastutka_app -f
docker service logs lounastutka_frontend -f
docker service logs lounastutka_traefik -f
```

For longer-term monitoring, use Grafana and Loki rather than raw service logs.

### Access the services

- Application via Traefik: `https://lounastutka.fi`
- Traefik dashboard: `https://dashboard.swarm.lounastutka.fi/`
- Grafana: `http://lounastutka.fi:3000` (port 3000 on the Hetzner server)
- Prometheus: internal-only by default
- Loki: internal-only by default

> The server IP is stored in the `HETZNER_HOST` GitHub secret. Do not commit it to the repository.

Default Grafana credentials are `admin` / `admin` unless changed.

### Remove the stack

```bash
docker stack rm lounastutka
```

To leave Swarm mode entirely:

```bash
docker swarm leave --force
```

---

## Local Development

Use the development setup for a fast local loop. No images need to be built — it uses the official `oven/bun:1` image directly and mounts your source code into the container.

### Prerequisites

Create a `.env` file in the repository root:

```bash
echo "POSTGRES_PASSWORD=yourpassword" > .env
```

### Start

```bash
docker compose -f compose.dev.yaml up
```

This starts:

- `backend` on `http://localhost:3001` — runs `bun --watch`, live reloads on file save
- `frontend` on `http://localhost:5173` — Vite dev server with HMR
- `db` on `localhost:5432`

### Stop

```bash
docker compose -f compose.dev.yaml down
```

To also remove local dev volumes (resets the database):

```bash
docker compose -f compose.dev.yaml down -v
```

---

## Production Notes

1. **Images**: Built by GitHub Actions and stored in `ghcr.io`. Each build is tagged with both `:latest` and the git commit SHA for rollbacks.
2. **Secrets**: `POSTGRES_PASSWORD` is injected at deploy time via the environment. Do not commit credentials to the repository.
3. **Stateful services**: Postgres and Grafana volumes are node-local. Keep placement constraints pinned to the manager node for single-node deployments.
4. **HTTPS**: TLS certificates are loaded from `./certs` via `dynamic/tls.yaml`. Place your certificates there before deploying. Traefik handles HTTP→HTTPS redirects automatically.

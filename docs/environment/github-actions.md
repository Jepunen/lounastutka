# GitHub Actions

Lounastutka uses GitHub Actions to build Docker images and deploy the production Docker Swarm stack. The workflow is defined in:

```text
.github/workflows/deploy.yml
```

The workflow is named `Build & Deploy`.

## Purpose

The workflow handles two responsibilities:

- building the backend, frontend, and microservice Docker images
- deploying `compose.yaml` to the production server with Docker Swarm

Images are stored in GitHub Container Registry, using the `ghcr.io` registry.

## Triggers

The workflow runs on:

| Trigger | Behavior |
|---|---|
| Pull request opened against `main` | Builds images for validation, but does not push them. |
| Pull request synchronized against `main` | Rebuilds images after new commits, but does not push them. |
| Pull request reopened against `main` | Builds images for validation, but does not push them. |
| Pull request closed and merged into `main` | Builds, pushes, and deploys. |
| Manual `workflow_dispatch` | Builds, pushes, and deploys on demand. |

The workflow does not deploy every pull request. Deployment only happens when a pull request is merged or when the workflow is started manually.

## Jobs

The workflow has two jobs:

| Job | Purpose |
|---|---|
| `build-and-push` | Builds Docker images and pushes them when deployment is allowed. |
| `deploy` | Copies configuration to the server and runs `docker stack deploy`. |

## Build And Push Job

The `build-and-push` job runs on `ubuntu-latest`.

It has these permissions:

| Permission | Reason |
|---|---|
| `contents: read` | Allows the workflow to check out the repository. |
| `packages: write` | Allows pushing images to GitHub Container Registry. |

### Repository Name Normalization

The workflow converts `GITHUB_REPOSITORY` to lowercase:

```bash
echo "repo=${GITHUB_REPOSITORY,,}" >> "$GITHUB_OUTPUT"
```

This is needed because container registry image names must be lowercase. The normalized repository name is exposed as the `image_repo` job output and reused during deployment.

### Registry Login

The job logs in to GitHub Container Registry:

```text
ghcr.io
```

Authentication uses:

| Value | Source |
|---|---|
| Username | `${{ github.actor }}` |
| Password | `${{ secrets.GITHUB_TOKEN }}` |

`GITHUB_TOKEN` is provided automatically by GitHub Actions.

The job also logs in to Docker Hub to avoid anonymous pull rate limits when BuildKit pulls base images.

### Buildx

The workflow enables Docker Buildx with:

```yaml
docker/setup-buildx-action@v4
```

Buildx is used by the `docker/build-push-action` steps.

### Built Images

The workflow builds three images:

| Image | Build context | Platform |
|---|---|---|
| `backend` | `./Backend` | `linux/amd64` |
| `frontend` | `./Frontend` | `linux/amd64` |
| `microservice` | `./microservice` | `linux/amd64` |

Each image is tagged with:

| Tag | Purpose |
|---|---|
| `latest` | Convenient reference to the most recent deployed image. |
| `${{ github.sha }}` | Immutable image tag for the exact commit. |

The final image names follow this pattern:

```text
ghcr.io/<owner>/<repo>/backend:<tag>
ghcr.io/<owner>/<repo>/frontend:<tag>
ghcr.io/<owner>/<repo>/microservice:<tag>
```

For example:

```text
ghcr.io/example/lounastutka/backend:latest
ghcr.io/example/lounastutka/backend:<commit-sha>
```

### Push Rules

Images are pushed only when:

- the workflow was started manually with `workflow_dispatch`
- a pull request was merged

For normal pull request updates, the images are built but not pushed.

### Build Cache

Each image uses GitHub Actions cache with a separate scope:

| Image | Cache scope |
|---|---|
| Backend | `backend` |
| Frontend | `frontend` |
| Microservice | `microservice` |

The workflow reads from and writes to the cache:

```yaml
cache-from: type=gha,scope=<service>
cache-to: type=gha,mode=max,scope=<service>
```

This speeds up repeated builds.

## Deploy Job

The `deploy` job depends on `build-and-push`.

It runs only when:

- the workflow was started manually
- a pull request was merged

The deploy job performs two steps:

1. Copy configuration files to the production server.
2. SSH into the server and deploy the Docker Swarm stack.

## Files Copied To The Server

The workflow uses `appleboy/scp-action` to copy:

```text
compose.yaml
docker/
Database/
```

The files are copied to:

```text
/opt/lounastutka
```

These files are required because:

| Path | Purpose |
|---|---|
| `compose.yaml` | Production Docker Swarm stack definition. |
| `docker/` | Prometheus, Promtail, and Grafana configuration. |
| `Database/` | Database initialization SQL files. |

## Stack Deployment

The workflow uses `appleboy/ssh-action` to run deployment commands on the server.

Before deploying, it prepares the Traefik ACME certificate file:

```bash
mkdir -p /opt/lounastutka/letsencrypt
touch /opt/lounastutka/letsencrypt/acme.json
chmod 600 /opt/lounastutka/letsencrypt/acme.json
```

Then it logs in to GitHub Container Registry from the server:

```bash
echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
```

Finally, it deploys the stack:

```bash
docker stack deploy -c compose.yaml lounastutka --with-registry-auth
```

The `--with-registry-auth` flag forwards registry credentials to the Swarm so worker nodes can pull private images.

## Deployment Environment Variables

The deploy step passes environment variables directly into the `docker stack deploy` command.

| Variable | Purpose |
|---|---|
| `IMAGE_TAG` | The commit SHA image tag to deploy. |
| `GITHUB_REPOSITORY` | Lowercase repository path used in GHCR image names. |
| `POSTGRES_PASSWORD` | PostgreSQL password. |
| `POSTGRES_URL` | Backend database connection string. |
| `JWT_SECRET` | Backend JWT signing secret. |
| `WEBAUTHN_RP_ID` | WebAuthn relying party ID. |
| `WEBAUTHN_RP_NAME` | WebAuthn relying party name. |
| `WEBAUTHN_ORIGIN` | Allowed WebAuthn origin. |
| `HETZNER_API_TOKEN` | Hetzner DNS API token used by Traefik ACME DNS challenge. |
| `GF_ADMIN_PASSWORD` | Grafana admin password. |

These values are consumed by `compose.yaml`.

## Required Secrets

The workflow depends on these GitHub Actions secrets:

| Secret | Used by | Purpose |
|---|---|---|
| `HETZNER_HOST` | Deploy job | Production server hostname or IP address. |
| `HETZNER_USER` | Deploy job | SSH user used for deployment. |
| `HETZNER_SSH_KEY` | Deploy job | Private SSH key for the deployment user. |
| `POSTGRES_PASSWORD` | Deploy job | Production PostgreSQL password. |
| `POSTGRES_URL` | Deploy job | Backend database connection string. |
| `JWT_SECRET` | Deploy job | JWT signing secret. |
| `WEBAUTHN_RP_ID` | Deploy job | WebAuthn relying party ID. |
| `WEBAUTHN_RP_NAME` | Deploy job | WebAuthn relying party display name. |
| `WEBAUTHN_ORIGIN` | Deploy job | WebAuthn origin. |
| `HETZNER_API_TOKEN` | Deploy job | DNS token for Traefik certificate automation. |
| `GF_ADMIN_PASSWORD` | Deploy job | Grafana admin password. |
| `DOCKERHUB_USERNAME` | Build job | Docker Hub username for authenticated pulls. |
| `DOCKERHUB_TOKEN` | Build job | Docker Hub token for authenticated pulls. |

`GITHUB_TOKEN` is provided automatically by GitHub Actions and should not be added manually.

## Deployment Flow

The normal production deployment flow is:

1. A pull request is merged into `main`.
2. GitHub Actions checks out the repository.
3. The workflow logs in to GHCR and Docker Hub.
4. Buildx builds the backend, frontend, and microservice images.
5. Images are pushed to GHCR with `latest` and commit SHA tags.
6. The deploy job copies `compose.yaml`, `docker/`, and `Database/` to `/opt/lounastutka`.
7. The server logs in to GHCR.
8. Docker Swarm deploys the `lounastutka` stack using the new image tag.

## Manual Deployment

The workflow can also be started manually from the GitHub Actions UI using `workflow_dispatch`.

Manual deployment is useful when:

- redeploying the current commit
- recovering from a failed server-side deploy
- verifying deployment changes without merging a new pull request

Manual runs build, push, and deploy just like a merged pull request.

## Production Server Requirements

The production server must have:

- Docker Engine installed
- Docker Swarm initialized
- SSH access for the deployment user
- access to `/opt/lounastutka`
- permission to run Docker commands
- DNS records pointing to the server

The deployment user should be able to run:

```bash
docker stack deploy
docker service ls
docker service ps
docker service logs
```

## Verifying A Deployment

After a deployment, check the stack:

```bash
docker stack services lounastutka
```

Check backend tasks:

```bash
docker service ps lounastutka_app
```

Check frontend tasks:

```bash
docker service ps lounastutka_frontend
```

Check microservice tasks:

```bash
docker service ps lounastutka_microservice
```

Follow logs:

```bash
docker service logs -f lounastutka_app
docker service logs -f lounastutka_frontend
docker service logs -f lounastutka_microservice
docker service logs -f lounastutka_traefik
```

## Troubleshooting

### Build Runs But Images Are Not Pushed

This is expected for normal pull request builds. Images are pushed only for merged pull requests and manual workflow runs.

### Deploy Job Is Skipped

The deploy job runs only when:

- the event is `workflow_dispatch`
- the pull request was closed as merged

If a pull request is closed without merging, deployment is skipped.

### GHCR Push Fails

Check that the workflow has:

```yaml
permissions:
  contents: read
  packages: write
```

Also check repository package permissions if the image package already exists in GitHub Container Registry.

### Docker Hub Login Fails

Check these secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

This login is used to avoid Docker Hub pull rate limits while building images. It is separate from GHCR login.

### SSH Or SCP Fails

Check these secrets:

- `HETZNER_HOST`
- `HETZNER_USER`
- `HETZNER_SSH_KEY`

Also verify that the public key matching `HETZNER_SSH_KEY` exists in the deployment user's `authorized_keys` file on the server.

### Stack Deploy Fails To Pull Images

Check that:

- the images were pushed successfully to GHCR
- the server can log in to `ghcr.io`
- `docker stack deploy` includes `--with-registry-auth`
- `GITHUB_REPOSITORY` is lowercase in the deployed environment
- `IMAGE_TAG` matches an image tag that exists in GHCR

### Traefik Certificate Creation Fails

Check that:

- `HETZNER_API_TOKEN` is configured
- `/opt/lounastutka/letsencrypt/acme.json` exists
- `acme.json` has permission mode `600`
- the domain DNS records point to the server

The workflow creates the ACME file before each deployment, but DNS and token permissions must still be valid.

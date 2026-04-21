# Nginx

Nginx is used as the production web server for the Lounastutka frontend. It serves the static frontend files that are produced by the Vite build and runs inside the frontend Docker image.

Nginx is not used for active local frontend development. In local development, the frontend runs with the Vite dev server inside the `oven/bun:1` container.

## Role In The System

Nginx is responsible for:

- serving the built frontend application
- returning `index.html` for client-side routes
- caching hashed static assets
- forwarding selected frontend-origin API paths to the backend service

Traefik is still the public edge reverse proxy. In production, requests flow like this:

```text
User -> Traefik -> frontend service -> Nginx -> static frontend files
```

For backend traffic, Traefik normally routes `/api` directly to the backend service:

```text
User -> Traefik -> backend service
```

The Nginx config also contains API proxy rules for `/api` and `/auth`. These are useful if a request reaches the frontend container first and then needs to be forwarded internally to the backend.

## Where Nginx Is Configured

The Nginx configuration file is:

```text
Frontend/docker/nginx/default.conf
```

The frontend Dockerfile copies it into the Nginx image:

```dockerfile
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
```

The built frontend files are copied to:

```text
/usr/share/nginx/html
```

## Frontend Docker Image

The frontend image is built with `Frontend/Dockerfile`.

It has three stages:

| Stage | Base image | Purpose |
|---|---|---|
| `deps` | `node:22-alpine` | Installs frontend dependencies. |
| `build` | `node:22-alpine` | Builds the frontend with Vite. |
| final | `nginx:1.27-alpine` | Serves the built frontend files. |

The build command is:

```bash
npm run build
```

The `build` script runs:

```bash
vite build
```

Vite writes the production client bundle to:

```text
build/client
```

The final Docker image copies that output into Nginx:

```dockerfile
COPY --from=build /app/build/client /usr/share/nginx/html
```

## Server Block

The Nginx server listens on port `80`:

```nginx
server {
    listen 80;
    server_name _;
}
```

The wildcard `server_name _;` is used because Traefik handles the public hostname routing before traffic reaches the frontend container.

In Docker Swarm, Traefik routes frontend traffic to this internal port:

```yaml
traefik.http.services.frontend.loadbalancer.server.port=80
```

## Static File Root

Nginx serves files from:

```nginx
root /usr/share/nginx/html;
index index.html;
```

This directory contains the built Vite application.

## SPA Routing

The frontend is a single-page application. Browser routes such as `/settings` or `/components` are handled by the frontend router, not by separate files on disk.

Nginx supports this with:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This means:

1. Try to serve the requested file.
2. Try to serve the requested directory.
3. Fall back to `index.html`.

The fallback allows direct page refreshes and deep links to work.

## Static Asset Caching

Vite outputs static assets with content hashes in their filenames. Because the filename changes when the content changes, these files can be cached aggressively.

Nginx configures long-lived caching for:

```nginx
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

This improves frontend load times while still allowing safe cache busting when a new frontend build is deployed.

## API Proxy Rules

The Nginx config contains proxy rules for:

```text
/auth
/api
```

Both are forwarded to the backend service:

```nginx
proxy_pass http://app:3001;
```

In the production Swarm stack, the backend service is named:

```text
app
```

It listens internally on port:

```text
3001
```

The proxy configuration also forwards upgrade headers:

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
```

This preserves the original host and supports upgraded HTTP connections if the backend needs them.

## Production Routing

In production, Traefik exposes the frontend service at:

```text
https://lounastutka.fi
```

The frontend service uses the image:

```text
ghcr.io/${GITHUB_REPOSITORY}/frontend:${IMAGE_TAG:-latest}
```

The service is connected to the `traefik_proxy` network and Traefik routes to Nginx on port `80`.

Production frontend labels:

```yaml
- traefik.enable=true
- traefik.http.routers.frontend.rule=Host(`lounastutka.fi`)
- traefik.http.routers.frontend.entrypoints=websecure
- traefik.http.routers.frontend.tls=true
- traefik.http.routers.frontend.tls.certresolver=le
- traefik.http.services.frontend.loadbalancer.server.port=80
```

## Local Swarm Routing

In local Swarm, the frontend image is:

```text
lounastutka-frontend:local
```

Build it from the repository root:

```bash
docker build -t lounastutka-frontend:local ./Frontend
```

The frontend is available through Traefik at:

```text
http://localhost
```

Local Swarm frontend labels:

```yaml
- "traefik.enable=true"
- "traefik.http.routers.frontend.rule=Host(`localhost`)"
- "traefik.http.routers.frontend.entrypoints=web"
- "traefik.http.services.frontend.loadbalancer.server.port=80"
```

## Local Development

Local development does not use the Nginx frontend image.

Instead, `compose.dev.yaml` runs the frontend with:

```bash
bun install && bun run dev -- --host 0.0.0.0
```

The development frontend is available directly at:

```text
http://localhost:5173
```

It is also routed through Traefik at:

```text
https://localhost
```

Use the Nginx image when testing production-like behavior, especially SPA fallback and static asset caching.

## Useful Commands

Build the production frontend image locally:

```bash
docker build -t lounastutka-frontend:local ./Frontend
```

Run the local Swarm stack:

```bash
docker stack deploy -c compose.local.swarm.yaml lounastutka
```

Check the frontend service:

```bash
docker service ps lounastutka_frontend
```

Follow frontend service logs:

```bash
docker service logs -f lounastutka_frontend
```

Inspect the frontend image:

```bash
docker image inspect lounastutka-frontend:local
```

## Troubleshooting

### Page Refresh Returns 404

Check the SPA fallback:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

If this fallback is missing, direct navigation to frontend routes may fail.

### Static Assets Do Not Load

Check that the Vite build output exists in the image:

```text
/usr/share/nginx/html
```

Also check that `Frontend/vite.config.ts` still builds to:

```text
build/client
```

The Dockerfile expects that path.

### Frontend Service Returns Bad Gateway

If Traefik returns a bad gateway for the frontend route, check:

- the frontend service is running
- the frontend service is attached to `traefik_proxy`
- Traefik routes to port `80`
- Nginx is listening on port `80`

Useful commands:

```bash
docker service ps lounastutka_frontend
docker service logs -f lounastutka_frontend
docker service logs -f lounastutka_traefik
```

### API Calls Fail From The Frontend

Check whether the request is intended to go through Traefik or Nginx.

In production, `/api` is normally routed by Traefik directly to the backend service. If a request reaches the frontend container first, Nginx proxies `/api` and `/auth` to:

```text
http://app:3001
```

If that proxy path fails, check that:

- the backend service is named `app`
- the backend listens on port `3001`
- the frontend and backend share a Docker network where `app` resolves

### Old Frontend Assets Are Still Loaded

The `/assets/` directory is cached for one year because Vite assets are content-hashed.

If stale assets appear:

- verify the new build produced new hashed filenames
- verify the deployed image tag changed
- hard-refresh the browser
- check whether a CDN or browser cache is serving old HTML

The HTML document itself should not be cached as aggressively as hashed assets.

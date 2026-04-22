# Hetzner

Lounastutka is deployed on a Hetzner Cloud VPS. Hetzner was chosen because it was one of the cheapest suitable hosting options for the project, while still providing European infrastructure, simple VPS management, and DNS automation support.

The production environment runs on a single Hetzner Cloud server using the `CPX32` server type.

## Why Hetzner

Hetzner was selected for these reasons:

- it was one of the lowest-cost options that still provided enough resources for the application
- the servers are hosted in Europe
- Hetzner Cloud has a straightforward VPS model
- Hetzner DNS can be controlled through an API
- Traefik supports Hetzner DNS for Let's Encrypt DNS challenges
- the setup works well with Docker Swarm and GitHub Actions deployments

The project uses an external domain name, but DNS for that domain is controlled through Hetzner DNS.

## Server Type

The production VPS uses:

| Setting | Value |
|---|---|
| Provider | Hetzner Cloud |
| Server type | `CPX32` |
| CPU platform | AMD |
| vCPUs | 4 |
| Memory | 8 GB |
| Disk | 160 GB |
| Maximum monthly price | EUR 18.18 / month |
| Hourly price | EUR 0.0291 / hour |
| Role | Single-node production Docker Swarm host |
| Public networking | Paid IPv4 address |
| DNS provider | Hetzner DNS |

The CPX32 size gives the deployment enough capacity to run the application services, PostgreSQL, Traefik, monitoring, logging, and Portainer on one VPS while keeping hosting costs predictable.

The server hosts the full production stack:

- Traefik
- frontend
- backend API
- scraper microservice
- PostgreSQL
- Prometheus
- Loki
- Promtail
- Grafana
- Portainer

The stack currently runs as a single-node deployment. Docker Swarm is still used because it gives a production-style deployment model, service labels, rolling updates, and compatibility with Traefik's Swarm provider.

## IPv4 Address

The project uses a purchased IPv4 address for the production server.

This IPv4 address is used for:

- public web traffic to `lounastutka.fi`
- SSH access from GitHub Actions
- DNS `A` records
- Let's Encrypt certificate validation through Traefik and Hetzner DNS

The actual server IP should not be committed to the repository. It is stored as a GitHub Actions secret:

```text
HETZNER_HOST
```

## Domain And DNS

The application uses an external domain name:

```text
lounastutka.fi
```

The domain itself does not need to be registered at Hetzner, but its DNS is controlled through Hetzner DNS.

This allows Traefik to request Let's Encrypt certificates using the Hetzner DNS API. The Traefik production configuration uses:

```text
--certificatesresolvers.le.acme.dnschallenge=true
--certificatesresolvers.le.acme.dnschallenge.provider=hetzner
```

The Hetzner DNS API token is passed to Traefik through:

```text
HETZNER_API_TOKEN
```

In GitHub Actions this value comes from the secret:

```text
HETZNER_API_TOKEN
```

## DNS Records

The DNS records should point to the server's purchased IPv4 address.

Production routes currently include:

| Hostname | Purpose |
|---|---|
| `lounastutka.fi` | Main application frontend and API path routing. |
| `dashboard.swarm.lounastutka.fi` | Traefik dashboard. |
| `whoami.swarm.lounastutka.fi` | Traefik test service. |
| `prometheus.swarm.lounastutka.fi` | Prometheus. |
| `grafana.lounastutka.fi` | Grafana. |
| `portainer.lounastutka.fi` | Portainer. |

Each hostname should resolve to the Hetzner server's IPv4 address.

The main application uses path-based routing:

| URL | Target |
|---|---|
| `https://lounastutka.fi` | Frontend |
| `https://lounastutka.fi/api` | Backend API |
| `https://lounastutka.fi/scrape` | Scraper microservice |

## Server Directory

Deployment files are copied to:

```text
/opt/lounastutka
```

GitHub Actions copies these paths to the server:

```text
compose.yaml
docker/
Database/
```

Traefik certificate state is stored under:

```text
/opt/lounastutka/letsencrypt/acme.json
```

The deployment workflow creates this file before running Docker Swarm deploy:

```bash
mkdir -p /opt/lounastutka/letsencrypt
touch /opt/lounastutka/letsencrypt/acme.json
chmod 600 /opt/lounastutka/letsencrypt/acme.json
```

The `600` permission is required because Traefik refuses to use an ACME storage file that is too open.

## Docker Swarm

The Hetzner server runs Docker Swarm.

Initialize Swarm once on the server:

```bash
docker swarm init
```

The stack is deployed as:

```text
lounastutka
```

GitHub Actions deploys the stack with:

```bash
docker stack deploy -c compose.yaml lounastutka --with-registry-auth
```

The `--with-registry-auth` flag is important because production images are pulled from GitHub Container Registry.

## Deployment User

GitHub Actions connects to the Hetzner server over SSH.

The deployment user is configured through these GitHub Actions secrets:

| Secret | Purpose |
|---|---|
| `HETZNER_HOST` | Server IPv4 address or hostname. |
| `HETZNER_USER` | SSH user used by the deployment workflow. |
| `HETZNER_SSH_KEY` | Private SSH key for the deployment user. |

The deployment user must be able to:

- access `/opt/lounastutka`
- run Docker commands
- deploy Docker Swarm stacks
- read service logs for troubleshooting

Useful commands for checking server access:

```bash
docker stack services lounastutka
docker service ps lounastutka_traefik
docker service logs -f lounastutka_traefik
```

## Firewall And Open Ports

The production server needs these public ports:

| Port | Purpose |
|---:|---|
| `22` | SSH deployment access. |
| `80` | HTTP entrypoint and Let's Encrypt redirects. |
| `443` | HTTPS application traffic. |

Other service ports should normally stay internal to Docker networks and should be reached through Traefik instead of being exposed directly.

## Persistent Data

Several services store data on the Hetzner server through Docker volumes:

| Volume | Purpose |
|---|---|
| `pg_data` | PostgreSQL data. |
| `prom_data` | Prometheus data. |
| `grafana_data` | Grafana data. |
| `portainer_data` | Portainer data. |

The server also stores Let's Encrypt certificate state in:

```text
/opt/lounastutka/letsencrypt
```

These volumes and files are part of the server state. Removing them may delete the production database, dashboards, monitoring history, or certificate state.

## GitHub Actions Integration

The deployment pipeline uses Hetzner in two ways:

1. It connects to the server using SSH.
2. It passes the Hetzner DNS API token to Traefik for certificate automation.

Required Hetzner-related secrets:

| Secret | Used for |
|---|---|
| `HETZNER_HOST` | SSH target server. |
| `HETZNER_USER` | SSH login user. |
| `HETZNER_SSH_KEY` | SSH authentication. |
| `HETZNER_API_TOKEN` | DNS challenge for Let's Encrypt certificates. |

The server IP and tokens should never be committed to the repository.

## Operational Notes

- The CPX32 server is the single production host.
- The server has 4 AMD vCPUs, 8 GB memory, and 160 GB disk.
- The listed server price is max. EUR 18.18 per month or EUR 0.0291 per hour.
- The public IPv4 address is paid separately and used for DNS records.
- DNS for the external domain is managed in Hetzner DNS.
- Traefik uses Hetzner DNS to create and renew Let's Encrypt certificates.
- Docker Swarm runs on the server even though the current setup is single-node.
- Stateful data is stored on the server, so volume backups matter.

## Troubleshooting

### GitHub Actions Cannot SSH To The Server

Check:

- `HETZNER_HOST` points to the correct IPv4 address or hostname
- `HETZNER_USER` is correct
- `HETZNER_SSH_KEY` matches a public key in the server user's `authorized_keys`
- port `22` is open
- the server is running

### Domain Does Not Resolve

Check the Hetzner DNS zone:

- the hostname exists
- the `A` record points to the purchased IPv4 address
- the DNS zone is active
- the domain uses the correct nameservers

### HTTPS Certificate Fails

Check:

- `HETZNER_API_TOKEN` is set in GitHub Actions secrets
- the token has permission to update the DNS zone
- DNS records point to the Hetzner server
- `/opt/lounastutka/letsencrypt/acme.json` exists
- `acme.json` has permission mode `600`

Then check Traefik logs:

```bash
docker service logs -f lounastutka_traefik
```

### Stack Is Running But Site Is Down

Check the Swarm services:

```bash
docker stack services lounastutka
```

Check Traefik:

```bash
docker service ps lounastutka_traefik
docker service logs -f lounastutka_traefik
```

Check the routed application services:

```bash
docker service ps lounastutka_frontend
docker service ps lounastutka_app
docker service ps lounastutka_microservice
```

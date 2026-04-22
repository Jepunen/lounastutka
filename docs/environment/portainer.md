# Portainer

Portainer is the management UI for the Lounastutka Docker Swarm environment. It provides a browser interface for inspecting services, tasks, containers, networks, volumes, and node state.

The project runs Portainer in the Swarm environments:

- local Swarm testing with `compose.local.swarm.yaml`
- production Swarm deployment with `compose.yaml`

Portainer is not part of the regular local development compose file.

## Role In The System

Portainer is responsible for:

- providing a web UI for Docker Swarm management
- connecting to Portainer agents running on Swarm nodes
- showing services, containers, logs, networks, and volumes
- storing Portainer configuration and UI state in a named Docker volume

Portainer is an operations tool. It is separate from the application runtime and from the monitoring stack.

## Services

The Portainer setup has two services:

| Service | Image | Purpose |
|---|---|---|
| `portainer_agent` | `portainer/agent:lts` | Runs on every node and exposes node/container details to Portainer. |
| `portainer` | `portainer/portainer-ce:lts` | Runs the Portainer Community Edition web UI. |

## Agent Configuration

The agent runs in global mode:

```yaml
portainer_agent:
  image: portainer/agent:lts
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - /var/lib/docker/volumes:/var/lib/docker/volumes
    - /:/host
  networks:
    - edge
  deploy:
    mode: global
    placement:
      constraints:
        - node.platform.os == linux
```

Global mode starts one agent task on every Linux Swarm node.

The agent mounts:

| Host path | Container path | Purpose |
|---|---|---|
| `/var/run/docker.sock` | `/var/run/docker.sock` | Access Docker engine metadata. |
| `/var/lib/docker/volumes` | `/var/lib/docker/volumes` | Inspect Docker volumes. |
| `/` | `/host` | Inspect host filesystem data needed by Portainer. |

These mounts give Portainer broad operational visibility into the nodes. Keep the Portainer route and login protected.

## Portainer UI Configuration

The Portainer UI service runs one replica:

```yaml
portainer:
  image: portainer/portainer-ce:lts
  command: -H tcp://tasks.portainer_agent:9001 --tlsskipverify
  volumes:
    - portainer_data:/data
  networks:
    - edge
    - traefik_proxy
```

Portainer connects to all agent tasks with:

```text
tcp://tasks.portainer_agent:9001
```

The `tasks.portainer_agent` DNS name resolves to the agent tasks in the Swarm service.

The UI listens internally on port `9000`. Traefik routes external browser traffic to that port.

## Routes

### Production

In production, Portainer is exposed through Traefik:

| Route | Router | Internal port |
|---|---|---:|
| `https://portainer.lounastutka.fi` | `portainer` | `9000` |

The production route uses HTTPS and the Let's Encrypt certificate resolver named `le`:

```yaml
- "traefik.http.routers.portainer.rule=Host(`portainer.lounastutka.fi`)"
- "traefik.http.routers.portainer.entrypoints=websecure"
- "traefik.http.routers.portainer.tls=true"
- "traefik.http.routers.portainer.tls.certresolver=le"
- "traefik.http.services.portainer.loadbalancer.server.port=9000"
```

### Local Swarm

Local Swarm exposes Portainer through Traefik without TLS:

| Route | Router | Internal port |
|---|---|---:|
| `http://portainer.localhost` | `portainer` | `9000` |

## Networks

Portainer uses two Swarm networks:

| Network | Used by | Purpose |
|---|---|---|
| `edge` | `portainer`, `portainer_agent` | Internal Portainer-to-agent communication. |
| `traefik_proxy` | `portainer`, `traefik` | Public route through Traefik. |

The agent does not need to join `traefik_proxy` because browser traffic goes only to the Portainer UI service.

## Storage

Portainer stores its application data at:

```text
/data
```

Production persists that directory in:

```text
portainer_data
```

Local Swarm uses:

```text
portainer_data_local_swarm
```

Removing this volume removes Portainer state, including users, settings, and environment configuration.

## Placement

The Portainer UI runs on a manager node:

```yaml
deploy:
  replicas: 1
  placement:
    constraints:
      - node.role == manager
```

The Portainer agent runs on every Linux node:

```yaml
deploy:
  mode: global
  placement:
    constraints:
      - node.platform.os == linux
```

## Useful Commands

Show the Portainer UI service:

```bash
docker service ps lounastutka_portainer
```

Show the Portainer agent tasks:

```bash
docker service ps lounastutka_portainer_agent
```

Follow Portainer UI logs:

```bash
docker service logs -f lounastutka_portainer
```

Follow Portainer agent logs:

```bash
docker service logs -f lounastutka_portainer_agent
```

Inspect the Portainer service:

```bash
docker service inspect lounastutka_portainer
```

List stack services:

```bash
docker stack services lounastutka
```

For local Swarm, deploy the stack:

```bash
docker stack deploy -c compose.local.swarm.yaml lounastutka
```

Then open:

```text
http://portainer.localhost
```

## Troubleshooting

### Portainer Route Returns 404

A Traefik 404 usually means the request did not match a router.

Check that:

- the hostname is `portainer.lounastutka.fi` in production
- the hostname is `portainer.localhost` in local Swarm
- the Portainer service has `traefik.enable=true`
- the router uses the correct entrypoint
- Swarm labels are under `deploy.labels`

### Portainer Route Returns Bad Gateway

A bad gateway means Traefik matched the route but could not reach Portainer.

Check that:

- the Portainer task is running
- Portainer and Traefik both use the `traefik_proxy` network
- the load balancer port is `9000`
- the Portainer container is listening on port `9000`

### Portainer Cannot Connect To The Agent

Check that:

- `portainer_agent` has one task on each Linux node
- `portainer` and `portainer_agent` share the `edge` network
- the Portainer command points to `tcp://tasks.portainer_agent:9001`
- the agent service is healthy

Useful commands:

```bash
docker service ps lounastutka_portainer_agent
docker service logs -f lounastutka_portainer_agent
docker service logs -f lounastutka_portainer
```

### Portainer State Is Missing

Portainer stores state in the `portainer_data` volume. If the volume is removed or replaced, Portainer may start as a fresh installation.

Check the stack volumes:

```bash
docker volume ls
```

### Login Fails

Portainer manages its own users inside the data volume. If login fails, check whether the `portainer_data` volume is the expected one and whether the service was redeployed with a fresh volume.

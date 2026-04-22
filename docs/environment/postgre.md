# PostgreSQL

PostgreSQL is the relational database for Lounastutka. It stores user, authentication, restaurant, menu, and menu item data.

The project runs PostgreSQL in all Docker environments:

- local development with `compose.dev.yaml`
- local Swarm testing with `compose.local.swarm.yaml`
- production Swarm deployment with `compose.yaml`

The Docker service is named `db`.

## Role In The System

PostgreSQL is responsible for:

- storing application user accounts
- storing passkey authentication data
- storing temporary authentication challenges
- storing restaurants
- storing menus and menu items
- providing the backend API with persistent relational data

The backend connects to PostgreSQL through the `POSTGRES_URL` connection string.

## Service Configuration

Production uses the `postgres:16-alpine` image:

```yaml
db:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: ${POSTGRES_USER:-lounastutka}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    POSTGRES_DB: ${POSTGRES_DB:-lounastutka}
  volumes:
    - pg_data:/var/lib/postgresql/data
    - ./Database/init:/docker-entrypoint-initdb.d:ro
  networks:
    - backend
```

The database listens internally on port `5432`.

## Environment Variables

The PostgreSQL service uses:

| Variable | Purpose | Default |
|---|---|---|
| `POSTGRES_USER` | Database user created by the image. | `lounastutka` |
| `POSTGRES_PASSWORD` | Password for the database user. | No production default |
| `POSTGRES_DB` | Database name created by the image. | `lounastutka` |

The backend uses:

| Variable | Purpose |
|---|---|
| `POSTGRES_URL` | Full PostgreSQL connection string used by the backend API. |

Production receives `POSTGRES_PASSWORD` and `POSTGRES_URL` from GitHub Actions secrets during deployment.

Example local connection string:

```text
postgres://lounastutka:changeme@db:5432/lounastutka
```

## Networks

### Production And Local Swarm

In Swarm environments, PostgreSQL is connected only to the internal `backend` network:

```yaml
networks:
  - backend
```

It is not exposed through Traefik and it does not publish port `5432` to the host.

Services that need database access must join the `backend` network. The backend API and scraper microservice are connected to this network.

### Local Development

In local development, PostgreSQL is connected to the `proxy` network and publishes port `5432`:

```yaml
ports:
  - "5432:5432"
```

This allows local tools to connect directly to PostgreSQL through:

```text
localhost:5432
```

## Storage

PostgreSQL stores database files in:

```text
/var/lib/postgresql/data
```

Each environment uses a different Docker volume:

| Environment | Volume |
|---|---|
| Production | `pg_data` |
| Local Swarm | `pg_data_local_swarm` |
| Local development | `pg_data_dev` |

Removing the volume deletes the database data for that environment.

## Initialization

The repository stores database initialization SQL in:

```text
Database/init
```

The folder is mounted into the PostgreSQL image at:

```text
/docker-entrypoint-initdb.d
```

PostgreSQL runs files from this directory only when the database volume is initialized for the first time. If the volume already contains a database, changing `Database/init/schema.sql` does not automatically apply changes.

To apply schema changes to an existing database, use migrations or run SQL manually.

## Schema

The current schema file is:

```text
Database/init/schema.sql
```

It creates the `app` schema:

```sql
CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION lounastutka;
```

It creates these tables:

| Table | Purpose |
|---|---|
| `app.users` | User accounts and password hashes. |
| `app.passkeys` | WebAuthn passkey credentials. |
| `app.auth_challenges` | Temporary authentication challenges. |
| `app.restaurants` | Restaurant metadata. |
| `app.menus` | Menus by restaurant and date. |
| `app.menu_items` | Individual menu items. |

The restaurant, menu, passkey, and challenge tables use foreign keys with `ON DELETE CASCADE` where related rows should be removed with their parent row.

## Placement

In Swarm environments, PostgreSQL runs as one replica on a manager node:

```yaml
deploy:
  replicas: 1
  placement:
    constraints:
      - node.role == manager
```

This keeps the database tied to the node that has the expected Docker volume.

## Healthcheck

Local development defines a PostgreSQL healthcheck:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-lounastutka}"]
  interval: 5s
  timeout: 5s
  retries: 5
```

The backend waits for this healthcheck in `compose.dev.yaml`.

The Swarm compose files do not currently define a database healthcheck.

## Useful Commands

Show the PostgreSQL service:

```bash
docker service ps lounastutka_db
```

Follow PostgreSQL logs:

```bash
docker service logs -f lounastutka_db
```

Inspect the service:

```bash
docker service inspect lounastutka_db
```

List stack services:

```bash
docker stack services lounastutka
```

For local development logs:

```bash
docker compose -f compose.dev.yaml logs -f db
```

Connect from the local development host:

```bash
psql postgres://lounastutka:changeme@localhost:5432/lounastutka
```

Connect from inside the local development container:

```bash
docker compose -f compose.dev.yaml exec db psql -U lounastutka -d lounastutka
```

## Backups

The production database is stored in the `pg_data` Docker volume on the Hetzner server.

Before destructive changes, create a database dump:

```bash
docker exec $(docker ps -q -f name=lounastutka_db) pg_dump -U lounastutka lounastutka > lounastutka.sql
```

Also back up the Docker volume or the server state if the deployment depends on local volume persistence.

## Troubleshooting

### Backend Cannot Connect To Database

Check that:

- the `db` service is running
- the backend and database share the `backend` network in Swarm
- `POSTGRES_URL` points to `db:5432`
- `POSTGRES_PASSWORD` matches the initialized database user password
- the database volume was not initialized with different credentials

Useful commands:

```bash
docker service logs -f lounastutka_db
docker service logs -f lounastutka_app
```

### Password Changes Do Not Work

The official PostgreSQL image uses `POSTGRES_PASSWORD` when initializing a new database directory. If the `pg_data` volume already exists, changing the environment variable does not rewrite the existing user's password.

Update the password inside PostgreSQL or recreate the volume only if losing the data is acceptable.

### Schema Changes Do Not Appear

Files in `Database/init` run only during first initialization. If `pg_data` already exists, updates to `schema.sql` will not be applied automatically.

Use migrations or apply SQL manually for existing databases.

### Local Port 5432 Is Not Reachable

Port `5432` is published only in `compose.dev.yaml`.

For Swarm environments, PostgreSQL is internal-only. Connect through a container on the `backend` network or use an SSH tunnel if direct database access is needed.

### Database Data Is Missing

Check whether the expected Docker volume exists:

```bash
docker volume ls
```

Production data should be in:

```text
pg_data
```

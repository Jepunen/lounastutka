## PostgreSQL DB

The project uses PostgresSQL relational database for storing relevant user and restaurant information. The database is run as a separate docker service and accessed by the backend docker service via the defined helpers in `Backend/database/`.

The .sql files under `Database/init/` are mounted to the docker service environment and executed during the first initialization of the database.

The user `lounastutka` is authorized to access the database and the environment variables should be set correctly for that user to have access from the backend. This setup is different for production and for local development and is described in `Environment` -section. Examples can be seen in .env-example and within the docker compose files.


Diagram built automatically with https://drawsql.app/ by importing the database schema.sql.


![Database tables](./../architecture/imgs/DatabaseTables.png)

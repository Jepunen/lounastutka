## PostgreSQL DB

The project uses PostgresSQL relational database for storing relevant user and restaurant information. The databse is run as separate docker service and accessed by the backend docker service and potentially the microservice image.

The .sql files under `init/` are executed during the first initialization of the database and need to be mounted / copied to the database docker service environment.



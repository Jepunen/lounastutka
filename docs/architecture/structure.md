# The Architecture

The main application components are described here, without the infrastructure components such as traefik, grafana, portainer, docker etc. as they are shown within the deployment diagram. The diagram style utilized here is the C4 models "Container" view and is built with `plantuml`.

---

**Containers:**

- **Basic User:** User that does not necessarly want to login but wants to check local restaurant menus via interactive map.
- **Restaurant User:** User who might want to add their restaurant information on the website for other users to see.
- **Frontend (bunjs nginx react):** Responsible for showing user the main content of the application. This is the service user directly interacts with, others are internal and only accessible through APIs.
- **Backend (bunjs express):** Handles the data flow between frontend, microservice and database.
- **Microservice (python):** Scrapes a website based on the given URL and tries to gather menu data.
- **Database (postgresql):** Stores applications content such as information about the restaurants as well as metadata about the users that want to authenticate. 


![Microservice](./imgs/MicroserviceContainers.png){ align=left }



# Backend

### Setup: 

You need to have bun.js installed: https://bun.com/docs/installation 

Install dependencies for the application backend:

```bash
[project_root]$ cd Backend/
[Backend]$ bun install
```

To run the server as standalone instance instead of docker container:

```bash
[Backend]$ bun run index.ts
```

For better testing it is recommended to run the whole setup with:

```bash
# To build and start the services:
[project_root]$ docker compose -f compose.dev.yaml up --build

# To stop them:
[project_root]$ docker compose -f compose.dev.yaml down

# And to remove the volumes as well:
[project_root]$ docker compose -f compose.dev.yaml down -v
```

## Maintenance & Development

The backend is divided to the following structure:


```bash
[Backend]$ tree -I node_modules -I docs
.
├── bun.lock
├── controllers
│   ├── auth.controller.ts
│   ├── protected.controller.ts
│   ├── restaurant.controller.ts
│   └── types.ts
├── database
│   ├── helpers.ts
│   └── models.ts
├── Dockerfile
├── index.ts
├── middleware
│   ├── auth.middleware.ts
│   ├── auth.validator.ts
│   ├── error.middleware.ts
│   └── validator.ts
├── package.json
├── README.md
├── routes
│   ├── auth.routes.ts
│   ├── protected.routes.ts
│   └── restaurant.routes.ts
├── services
│   ├── auth.service.ts
│   ├── protected.service.ts
│   └── restaurant.service.ts
├── tsconfig.json
└── utils
    └── error.ts

```

Current dependencies can be found in the `package.json` file and package versions should be updated when vulneraibility patches come. 

About the files, folders and their ideas:

**index.ts:** Entry to the backend application, defines the used features, e.g. express, cors etc.

**utils/:** Global utility methods and classes should lay here as they can be easily imported to the relevant source code files. E.g error handler

**routes/:** routes that can be called to the backend defined here and which middleware are used, e.g. with this defined in index.ts:
`app.use("/api/protected", protectedRoutes);`
and in routes/protected.routes.ts
`router.get("/hello-there", authenticateToken, helloThere);`.

**controllers/:** Here are defined the methods that handle calling appropriate services and acts as HTTP endpoint, the controllers deal with the request and response objects and if something goes wrong, calls the next middleware for errors or responds back to the caller with the response object.

**services/:** These are called by the controllers and these methods handle the business logic of the backend application, calling queries to the database, potentially other services, e.g. the microservice etc. 

**database/:** Acts as API to the database service, containing the database schema based typescript models and including the methods that make the database SQL queries via bun.js SQL library. It also has the connection initialization and its usage should be as easy as importing it to a service file and using e.g. `await db.findUserByID(...)`. 

**middlewares/:** This folder includes all of the custom middleware methods such as email & password verification and token verification and custom error handler for express.


#### API Documentation

The API documentation is built from the developer written `typedoc` [style](https://typedoc.org/) code comments and typedoc parsed method declarations. The documentation index.html can be created with:

```bash
[Backend]$ bun run typedoc --entryPointStrategy Expand routes/* controllers/* middleware/* 
```

, this should create the new html files under `Backend/docs/` folder. 

**NOTE:** For better documentation, strong typing is recommended as typedoc can and will complain if there are 'any' types around.


#### Error handling

Currently there exists only the generic error handling code that shows the end-user generic error code rather than showing the full stack from backend as it could potentially contain protected information and in the end wouldn't help a normal user. This relies on the fact that when developing and using error messages, it is important to differentiate what types of errors the user should see and what should remain under the maintainers logs, e.g. 4xx codes vs 5xx codes. 


**NOTE:** This project was created using `bun init` in bun v1.3.10. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.




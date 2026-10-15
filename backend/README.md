# Backend — Global Barber Society

The backend component of Global Barber Society, built with Java, Spring Boot, and Maven.

## Tech Stack

- Java
- Spring Boot
- Maven

## Prerequisites

- A Java Development Kit (JDK) version compatible with the project
- Maven
- The environment configuration required by the application

Check the Maven configuration and `application.properties` to determine the exact Java version and required settings.

## Configuration

The backend uses application configuration and environment variables.

Before starting the application:

1. Review `src/main/resources/application.properties`.
2. Identify the environment variables required by the application.
3. Configure the required database, service, and integration settings for your environment.
4. Keep credentials and private configuration files outside version control.

If a local `.env` file is required, configure it according to the existing application setup. Never commit production secrets or service-account credentials.

## Run Locally

From the `backend` directory, start the application with Maven:

```bash
mvn spring-boot:run
```

Ensure all required environment variables and external services are configured before starting the backend.

## Build

Package the application using Maven:

```bash
mvn clean package
```

The generated build artifacts are written to the Maven `target` directory.

## API Documentation

Review the backend source code to identify the available controllers, routes, request formats, and response formats.

API documentation should be added here once the implemented endpoints and their requirements have been verified.

## Security

- Keep credentials outside source control.
- Use environment variables for sensitive settings.
- Configure CORS for the intended frontend origins.
- Do not commit Firebase service-account files or private keys.

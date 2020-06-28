# journal

Journal-like webapp to easily keep track of varous things.

This project's purpose is to get some experience with the following technologies, as well as work on some basic standards for future projects:

- ASP.NET Core 3.1 on serverside
- React-Redux + Typescript on clientside
- Google's Material-UI
- Docker for test environment
- MongoDB for persistency
- Swagger for API documentation
- Keycloak as OIDC provider
- XUnit for Unittests
- Easy-to-write integration tests
- SEQ for centralized logging
- Test environment automation

## API documentation

API documentation can be found at http://localhost:5000/swagger/

## Setup development environment

Run `docker-compose up` in the `dev-env` directory.

http://localhost:8080 is keycloak
http://localhost:8081 is seq
http://localhost:8082 is mongo-express


### Basic setup
After the containers have started, run the `Journal.EnvSetup` project for some basic configuration.
Note the Seq-API-Key and the Keycloak-ClientSecret in the output.

### Setup keycloak

Switch to the `journal` realm.
Generate a client secret for the `journal-api` and a user `test` with the password `test`.
The admin password for keycloak is `dev`.

### Setup user secrets

Get the client secret from keycloak (admin ui > journal realm > clients > api > credentials), save it: `dotnet user-secrets set KeycloakConfiguration:ClientSecret 30752589-2205-4f03-8d54-9f96b69dc3e5`
Get the API key from SEQ and save it: `dotnet user-secrets set SeqConfiguration:ApiKey KPBHP4qxPm2CF8KiE4w6`
Get the ConnectionString from mongodb and save it: `dotnet user-secrets set MongoConfiguration:ConnectionString mongodb://test:test@localhost?authSource=journal`

### Verify test environment

Run the integration tests to verify the test environment is successfully configured.

# Standards

## Backend
- API Documentation
- Integration tests for every single API endpoint (Positive result, important errors, security)
- Simple controllers (only authentication & orchestration of services)
- Business logic is only within model or service classes
- Business logic is unit tested

## Automation
- Fully automatic build pipeline
- Fully automatic test environment setup

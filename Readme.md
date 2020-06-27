# journal

# API documentation

API documentation can be found at http://localhost:5000/swagger/

# Setup development environment

Run `docker-compose up` in the `dev-env` directory.

http://localhost:8080 is keycloak
http://localhost:8081 is seq
http://localhost:8082 is mongo-express


### Setup keycloak

Run the keycloak docker container and create a new realm `journal`, a client `api` and a user `test` with the password `test`.
The admin password for keycloak is `dev`.

### Setup SEQ

Add an API-Key.

### Setup mongodb

```
docker exec -it mongo bash
mongo -u admin -p dev
use journal
db.createUser({
	user: "test",
	pwd: "test",
	roles: [ "readWrite" ]
})
```

### Setup user secrets

Get the client secret from keycloak (admin ui > journal realm > clients > api > credentials), save it: `dotnet user-secrets set KeycloakConfiguration:ClientSecret 30752589-2205-4f03-8d54-9f96b69dc3e5`
Get the API key from SEQ and save it: `dotnet user-secrets set SeqConfiguration:ApiKey KPBHP4qxPm2CF8KiE4w6`
Get the ConnectionString from mongodb and save it: `dotnet user-secrets set MongoConfiguration:ConnectionString mongodb://test:test@localhost?authSource=journal`


# journal

# Setup development environment

### Setup keycloak

Run the keycloak docker container and create a new realm `journal`, a client `api` and a user `test` with the password `test`.
The admin password for keycloak is `dev`.

### Setup SEQ

Add an API-Key.

### Setup user secrets

Get the client secret from keycloak (admin ui > journal realm > clients > api > credentials), save it: `dotnet user-secrets set KeycloakConfiguration:ClientSecret 30752589-2205-4f03-8d54-9f96b69dc3e5`
Get the API key from SEQ and save it: `dotnet user-secrets set SeqConfiguration:ApiKey KPBHP4qxPm2CF8KiE4w6`


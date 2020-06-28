docker stop keycloak
docker rm keycloak
docker-compose up
if errorlevel 1 (
pause
)
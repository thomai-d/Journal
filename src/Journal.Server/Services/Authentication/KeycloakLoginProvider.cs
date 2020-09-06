using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Authentication;
using System.Threading.Tasks;
using Flurl.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace Journal.Server.Services.Authentication
{
    public class KeycloakLoginProvider : ILoginProvider
    {
        private readonly KeycloakConfiguration config;
        private readonly ILogger<KeycloakLoginProvider> logger;

        public KeycloakLoginProvider(IOptions<KeycloakConfiguration> keycloakOptions, ILogger<KeycloakLoginProvider> logger)
        {
            this.config = keycloakOptions.Value;
            this.logger = logger;
        }

        public async Task<Tokens> LoginAsync(string username, string password)
        {
            try
            {
                var result = await this.config.TokenUrl
                                    .PostUrlEncodedAsync(new
                                    {
                                        client_id = this.config.ClientId,
                                        grant_type = "password",
                                        scope = "openid offline_access",
                                        username, password,
                                        client_secret = this.config.ClientSecret
                                    })
                                    .ReceiveJson<KeycloakLoginResult>();

                this.logger.LogInformation("Generated token for {user}", username);

                return new Tokens()
                {
                    AccessToken = result.AccessToken,
                    IdToken = result.IdToken,
                    RefreshToken = result.RefreshToken
                };
            }
            catch (FlurlHttpException ex) when (ex.Call.HttpStatus == HttpStatusCode.Unauthorized)
            {
                this.logger.LogWarning("Token generation failed for {user}", username);
                throw new AuthenticationException("Login - Keycloak server returned 401");
            }
        }

        public async Task<Tokens> RefreshTokenAsync(string refreshToken)
        {
            try
            {
                var result = await this.config.TokenUrl
                                    .PostUrlEncodedAsync(new
                                    {
                                        client_id = this.config.ClientId,
                                        grant_type = "refresh_token",
                                        scope = "openid offline_access",
                                        client_secret = this.config.ClientSecret,
                                        refresh_token = refreshToken,
                                    })
                                    .ReceiveJson<KeycloakLoginResult>();

                this.logger.LogInformation("Token refreshed");

                return new Tokens()
                {
                    AccessToken = result.AccessToken,
                    IdToken = result.IdToken,
                    RefreshToken = result.RefreshToken
                };
            }
            catch (FlurlHttpException ex) when (ex.Call.HttpStatus == HttpStatusCode.Unauthorized)
            {
                this.logger.LogWarning("Token refresh failed");
                throw new AuthenticationException("TokenRefresh - Keycloak server returned 401");
            }
        }
    }
}

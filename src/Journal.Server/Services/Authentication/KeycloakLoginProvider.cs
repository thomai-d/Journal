using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Authentication;
using System.Threading.Tasks;
using Flurl.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace Journal.Server.Services.Authentication
{
    public class KeycloakLoginProvider : ILoginProvider
    {
        private readonly KeycloakConfiguration config;

        public KeycloakLoginProvider(IOptions<KeycloakConfiguration> keycloakOptions)
        {
            this.config = keycloakOptions.Value;
        }

        public async Task<LoginResult> LoginAsync(string username, string password)
        {
            try
            {
                var result = await this.config.TokenUrl
                                    .PostUrlEncodedAsync(new
                                    {
                                        client_id = this.config.ClientId,
                                        grant_type = "password",
                                        scope = "openid",
                                        username, password,
                                        client_secret = this.config.ClientSecret
                                    })
                                    .ReceiveJson<KeycloakLoginResult>();

                return new LoginResult()
                {
                    AccessToken = result.AccessToken,
                    IdToken = result.IdToken,
                    RefreshToken = result.RefreshToken
                };
            }
            catch (FlurlHttpException ex) when (ex.Call.HttpStatus == HttpStatusCode.Unauthorized)
            {
                throw new AuthenticationException("Keycloak server returned 401");
            }
        }
    }
}

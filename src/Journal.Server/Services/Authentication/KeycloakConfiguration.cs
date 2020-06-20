using System;
using System.Collections.Generic;
using System.Reflection;

namespace Journal.Server.Services.Authentication
{
    public class KeycloakConfiguration
    {
        /// <summary>
        /// Gets or sets the client id of this application.
        /// </summary>
        public string ClientId { get; set; }

        /// <summary>
        /// Gets or sets the Keycloak implicit token retrieve api URL.
        /// </summary>
        public string TokenUrl { get; set; }

        /// <summary>
        /// Gets or sets the ClientId used to retrieve tokens from Keycloak.
        /// </summary>
        public string ClientSecret { get; set; }

        /// <summary>
        /// Gets or sets the Authority URL.
        /// </summary>
        public string Authority { get; set; }
        
        /// <summary>
        /// Gets or sets the required audience for this application.
        /// </summary>
        public string RequiredAudience { get; set; }

        public void Validate()
        {
            var properties = this.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (var prop in properties)
            {
                var value = prop.GetValue(this) as string;
                if (string.IsNullOrEmpty(value))
                    throw new InvalidOperationException($"{nameof(KeycloakConfiguration)}.{prop.Name} is not set");
            }
        }
    }
}

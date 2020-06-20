using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Journal.Server.Services.Authentication
{
    public class LoginResult
    {
        public string AccessToken { get; set; }

        public string RefreshToken { get; set; }

        public string IdToken { get; set; }
    }
}

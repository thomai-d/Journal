using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Authentication;
using System.Threading.Tasks;
using Journal.Server.Services.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Journal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly ILoginProvider loginProvider;

        public LoginController(ILoginProvider loginProvider)
        {
            this.loginProvider = loginProvider;
        }

        [HttpPost]
        public async Task<ActionResult<LoginResult>> LoginAsync([FromBody]LoginParameter param)
        {
            if (string.IsNullOrEmpty(param.User)
             || string.IsNullOrEmpty(param.Password))
            {
                return this.BadRequest(new { error = "Username or password empty" });
            }

            try
            {
                var loginResult = await this.loginProvider.LoginAsync(param.User, param.Password);
                return this.Ok(loginResult);
            }
            catch (AuthenticationException)
            {
                return this.Unauthorized();
            }
        }

        [Authorize]
        [HttpGet("isAuthenticated")]
        public bool IsAuthenticated()
        {
            return true;
        }

        public class LoginParameter
        {
            public string User { get; set; }
            public string Password { get; set; }
        }
    }
}

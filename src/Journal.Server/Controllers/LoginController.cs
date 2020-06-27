using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Authentication;
using System.Threading.Tasks;
using Journal.Server.Controllers.ApiModel;
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

        /// <summary>
        /// Login with username and password and retrieve access and id token.
        /// </summary>
        /// <response code="200">Authentication successful</response>
        /// <response code="401">Authentication failed</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesErrorResponseType(typeof(void))]
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

        /// <summary>
        /// Endpoint to test if the currently provided access token is valid.
        /// </summary>
        /// <response code="200">Token is valid</response>
        /// <response code="401">Token is not valid</response>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesErrorResponseType(typeof(void))]
        [Authorize]
        [HttpGet("isAuthenticated")]
        public ActionResult<bool> IsAuthenticated()
        {
            return true;
        }
    }
}

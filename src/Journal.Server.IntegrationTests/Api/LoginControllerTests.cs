using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Flurl.Http;
using Newtonsoft.Json;
using Journal.Server.Controllers;
using Journal.Server.Services.Authentication;
using FluentAssertions;
using System.Net;
using Journal.Server.Controllers.ApiModel;

namespace Journal.Server.IntegrationTests.Api
{
    public class LoginControllerTests
    {
        private readonly IntegrationTestHost testHost;

        public LoginControllerTests()
        {
            this.testHost = new IntegrationTestHost();
        }

        [Fact]
        public async Task Login_Should_Succeed_With_DevCredentials()
        {
            var response = await this.testHost.PostAsync("/api/login", new LoginParameter
            {
                User = "test",
                Password = "test"
            });

            var result = await response.As<Tokens>();
            result.IdToken.Should().NotBeEmpty();
            result.RefreshToken.Should().NotBeEmpty();
            result.AccessToken.Should().NotBeEmpty();
        }
        
        [Fact]
        public async Task Login_Should_Fail_With_Invalid_Credentials()
        {
            var response = await this.testHost.PostAsync("/api/login", new LoginParameter
            {
                User = "asdjkfl",
                Password = "ajskldfaksj"
            });

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
        
        [Fact]
        public async Task Login_Should_Fail_With_Missing_Credentials()
        {
            var response = await this.testHost.PostAsync("/api/login", new { });

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }
        
        [Fact]
        public async Task Client_Should_Not_Be_Authenticated_Without_Bearer()
        {
            var response = await this.testHost.Client.GetAsync("/api/login/isAuthenticated");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
        
        [Fact]
        public async Task Login_Convenience_Method_Should_Succeed()
        {
            await this.testHost.LoginAsync();
        }
        
        [Fact]
        public async Task AuthToken_Should_Have_Some_Fields()
        {
            await this.testHost.LoginAsync();
            this.testHost.AccessToken.Audiences.Should().Contain("journal-api");
        }
    }
}

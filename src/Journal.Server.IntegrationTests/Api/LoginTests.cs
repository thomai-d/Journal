using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Journal.Server.IntegrationTests.Api
{
    public class LoginTests : IClassFixture<IntegrationTestHost>
    {
        private readonly IntegrationTestHost testHost;
        private readonly HttpClient client;

        public LoginTests(IntegrationTestHost testHost)
        {
            this.testHost = testHost;
            this.client = testHost.CreateDefaultClient();
        }

        [Fact]
        public async Task Login_Should_Succeed()
        {
            var result = await this.client.PostAsync("/api/login", new FormUrlEncodedContent(new[] { new KeyValuePair<string, string>("user", "username") }));
            result.EnsureSuccessStatusCode();
        }
    }
}

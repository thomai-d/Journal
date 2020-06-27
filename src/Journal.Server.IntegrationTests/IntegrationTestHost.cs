using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Journal.Server.Controllers;
using Journal.Server.Services.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;

namespace Journal.Server.IntegrationTests
{
    /// <summary>
    /// Test host for integration tests (includes mocked services & authentication).
    /// </summary>
    public class IntegrationTestHost : WebApplicationFactory<Startup>
    {
        public IntegrationTestHost()
        {
            this.Client = this.CreateDefaultClient();
        }

        public HttpClient Client { get; }

        public JwtSecurityToken AccessToken { get; private set; }

        public T GetService<T>()
        {
            return this.Services.GetRequiredService<T>();
        }

        public async Task<T> GetAsync<T>(string path)
        {
            var response = await this.Client.GetAsync(path);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(json);
        }

        public async Task<HttpResponseMessage> PostAsync(string path, object data)
        {
            var json = JsonConvert.SerializeObject(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            return await this.Client.PostAsync(path, content);
        }

        public async Task LoginAsync()
        {
            var response = await this.PostAsync("/api/login", new LoginController.LoginParameter
            {
                User = "test",
                Password = "test"
            });

            var result = await response.As<LoginResult>();
            this.Client.DefaultRequestHeaders.Add("Authorization", $"Bearer {result.AccessToken}");
            var isAuthenticated = await this.GetAsync<bool>("/api/login/isAuthenticated");
            isAuthenticated.Should().BeTrue();

            var handler = new JwtSecurityTokenHandler();
            this.AccessToken = handler.ReadToken(result.AccessToken) as JwtSecurityToken;
        }

        public void Logout()
        {
            this.Client.DefaultRequestHeaders.Clear();
            this.AccessToken = null;
        }
        
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
            });
        }
    }
}

using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Journal.Server.Controllers.ApiModel;
using Journal.Server.DataAccess;
using Journal.Server.Model;
using Journal.Server.Services.Authentication;
using Microsoft.AspNetCore.Hosting;
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
        public JwtSecurityToken RefreshToken { get; private set; }
        public JwtSecurityToken IdToken { get; private set; }

        public T GetService<T>()
        {
            return this.Services.GetRequiredService<T>();
        }
        
        public async Task DeleteDocumentsForAuthorAsync(string author)
        {
            var docRepo = this.GetService<IDocumentRepository>();
            await docRepo.DeleteAllDocumentsFromAuthorAsync(author);
        }

        public async Task InsertDocumentsAsync(string author, params Document[] documents)
        {
            var docRepo = this.GetService<IDocumentRepository>();
            foreach (var doc in documents)
            {
                await docRepo.AddAsync(doc, Array.Empty<Attachment>());
            }
        }

        public async Task<T> GetAsync<T>(string path)
        {
            var response = await this.Client.GetAsync(path);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(json);
        }
        
        public async Task<T> PostAndGetAsync<T>(string path, object data)
        {
            var response = await this.PostAsync(path, data);
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(json);
        }

        public async Task<HttpResponseMessage> PostFormAsync(string path, object data)
        {
            var content = new MultipartFormDataContent();
            var parts = data.GetType().GetProperties()
                                      .Select(prop => new { prop.Name, Data = prop.GetValue(data) });
            foreach (var part in parts)
            {
                content.Add(new StringContent(part.Data.ToString()), part.Name);
            }

            return await this.Client.PostAsync(path, content);
        }

        public async Task<HttpResponseMessage> PostAsync(string path, object data)
        {
            var json = JsonConvert.SerializeObject(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            return await this.Client.PostAsync(path, content);
        }

        public async Task LoginAsync()
        {
            var response = await this.PostAsync("/api/login", new LoginParameter
            {
                User = "test",
                Password = "test"
            });

            var result = await response.As<Tokens>();
            this.Client.DefaultRequestHeaders.Add("Authorization", $"Bearer {result.AccessToken}");
            var isAuthenticated = await this.GetAsync<bool>("/api/login/isAuthenticated");
            isAuthenticated.Should().BeTrue();

            var handler = new JwtSecurityTokenHandler();
            this.AccessToken = handler.ReadToken(result.AccessToken) as JwtSecurityToken;
            this.RefreshToken = handler.ReadToken(result.RefreshToken) as JwtSecurityToken;
            this.IdToken = handler.ReadToken(result.IdToken) as JwtSecurityToken;
        }
        
        public async Task RefreshTokenAsync()
        {
            var response = await this.PostAsync("/api/login/refresh", new RefreshTokenParameter
            {
                RefreshToken = this.RefreshToken.RawData
            });

            var result = await response.As<Tokens>();
            this.Client.DefaultRequestHeaders.Clear();
            this.Client.DefaultRequestHeaders.Add("Authorization", $"Bearer {result.AccessToken}");
            var isAuthenticated = await this.GetAsync<bool>("/api/login/isAuthenticated");
            isAuthenticated.Should().BeTrue();

            var handler = new JwtSecurityTokenHandler();
            this.AccessToken = handler.ReadToken(result.AccessToken) as JwtSecurityToken;
            this.RefreshToken = handler.ReadToken(result.RefreshToken) as JwtSecurityToken;
            this.IdToken = handler.ReadToken(result.IdToken) as JwtSecurityToken;
        }

        public void Logout()
        {
            this.Client.DefaultRequestHeaders.Clear();
            this.AccessToken = null;
            this.RefreshToken = null;
            this.IdToken = null;
        }
        
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
            });
        }
    }
}

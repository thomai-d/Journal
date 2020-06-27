using System;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using System.Net;
using Newtonsoft.Json.Linq;
using Journal.Server.DataAccess;
using Journal.Server.Model;

namespace Journal.Server.IntegrationTests.Api
{
    public class DocumentControllerTests
    {
        private readonly IntegrationTestHost testHost;

        public DocumentControllerTests()
        {
            this.testHost = new IntegrationTestHost();
        }

        [Fact]
        public async Task Insert_Document_Should_Be_Persisted()
        {
            await this.testHost.LoginAsync();
            var response = await this.testHost.PostAsync("/api/document", new 
            {
                Content = "Hallo das ist ein #Test"
            });

            // Status code should be Created.
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Content should include the ID.
            var content = await response.Content.ReadAsStringAsync();
            var obj = JObject.Parse(content);
            var objId = obj["id"].Value<string>();
            objId.Should().NotBeEmpty();

            // Header should include the new location.
            response.Headers.Location.ToString().Should().StartWith("/api/document/");

            // Document properties should have been set.
            var docRepo = this.testHost.GetService<IDocumentRepository>();
            var persistedDoc = await docRepo.GetByIdAsync(objId);
            persistedDoc.Content.Should().Be("Hallo das ist ein #Test");
            persistedDoc.Author.Should().Be("test");
            persistedDoc.Created.Should().BeCloseTo(DateTime.Now, 1000);
            persistedDoc.Tags.Should().BeEquivalentTo("Test");
        }

        [Fact]
        public async Task Nonexistent_Document_Should_Return_404()
        {
            await this.testHost.LoginAsync();
            var response = await this.testHost.Client.GetAsync("/api/document/123");
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task Access_Denied_To_Document_Should_Also_Return_404()
        {
            var docRepo = this.testHost.GetService<IDocumentRepository>();
            var doc = new Document
            {
                Author = "not-test",
                Content = "Hallo",
                Created = DateTime.Now,
            };
            await docRepo.AddAsync(doc);

            await this.testHost.LoginAsync();
            var response = await this.testHost.Client.GetAsync($"/api/document/{doc.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task Document_Save_And_Load_Test()
        {
            await this.testHost.LoginAsync();

            var createdResult = await this.testHost.PostAsync("/api/document", new
            {
                Content = "Hallo i bims 1 content"
            });

            var loadedDoc = await this.testHost.GetAsync<Document>(createdResult.Headers.Location.ToString());
            loadedDoc.Content.Should().Be("Hallo i bims 1 content");
            loadedDoc.Author.Should().Be("test");
            loadedDoc.Created.Should().BeCloseTo(DateTime.Now, 1000);
        }
        
        [Fact]
        public async Task Get_Endpoint_Requires_Authentication()
        {
            var response = await this.testHost.Client.GetAsync("/api/document/abc");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
        
        [Fact]
        public async Task Post_Endpoint_Requires_Authentication()
        {
            var response = await this.testHost.Client.PostAsync("/api/document", new StringContent("{ Content = \"Hallo\" }"));
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}

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
using Newtonsoft.Json.Linq;
using Journal.Server.DataAccess;

namespace Journal.Server.IntegrationTests.Api
{
    public class DocumentTests
    {
        private readonly IntegrationTestHost testHost;

        public DocumentTests()
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
    }
}

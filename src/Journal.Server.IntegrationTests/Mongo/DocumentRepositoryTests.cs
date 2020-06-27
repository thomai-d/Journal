using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Castle.Core.Logging;
using FluentAssertions;
using Journal.Server.DataAccess;
using Journal.Server.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Journal.Server.IntegrationTests.Mongo
{
    public class DocumentRepositoryTests
    {
        private readonly IntegrationTestHost testHost;

        public DocumentRepositoryTests()
        {
            this.testHost = new IntegrationTestHost();
        }

        [Fact]
        public async Task Document_Simple_Persist_And_Rehydrate()
        {
            var target = this.testHost.GetService<IDocumentRepository>();

            var doc = new Document
            {
                Content = "#Hallo, wie gehts?",
                Author = "test",
                Created = DateTime.Now
            };

            await target.AddAsync(doc);

            var result = await target.GetByIdAsync("test", doc.Id.ToString());
            result.Content.Should().Be(doc.Content);
            result.Tags.Should().BeEquivalentTo("Hallo");
            result.Created.Should().BeCloseTo(doc.Created);
        }
        
        [Fact]
        public async Task Add_Should_Fail_On_Missing_Data()
        {
            var target = this.testHost.GetService<IDocumentRepository>();

            var doc = new Document
            {
            };

            Func<Task> act = async () => { await target.AddAsync(doc); };
            await act.Should().ThrowAsync<ValidationException>();
        }

        [Fact]
        public async Task DeleteAllDocumentsFromAuthor_Should_Work()
        {
            var target = this.testHost.GetService<IDocumentRepository>();

            await target.AddAsync(CreateValidDoc());
            await target.AddAsync(CreateValidDoc());
            await target.AddAsync(CreateValidDoc());
            
            var docs = await target.GetByTagsAsync("test", 10, "Hallo");
            docs.Count.Should().BeInRange(3, 10);

            await target.DeleteAllDocumentsFromAuthorAsync("test");

            docs = await target.GetByTagsAsync("test", 10, "Hallo");
            docs.Count.Should().Be(0);
        }
        
        [Fact]
        public async Task GetByTagsAsync_Should_Work()
        {
            var target = this.testHost.GetService<IDocumentRepository>();
            await target.DeleteAllDocumentsFromAuthorAsync("test");

            await target.AddAsync(CreateValidDoc("#a #b #c"));
            await target.AddAsync(CreateValidDoc("#a #b #d"));
            await target.AddAsync(CreateValidDoc("#a #d #f"));

            var docs = await target.GetByTagsAsync("test", 10, "a", "b");
            docs.Count.Should().Be(2);
            
            docs = await target.GetByTagsAsync("test", 1, "a", "b");
            docs.Count.Should().Be(1);
            
            docs = await target.GetByTagsAsync("test", 10, "b", "a");
            docs.Count.Should().Be(2);
            
            docs = await target.GetByTagsAsync("test", 10, "f", "b");
            docs.Count.Should().Be(0);
        }

        private static Document CreateValidDoc(string content = "#Hallo wie gehts")
        {
            return new Document
            {
                Content = content,
                Author = "test",
                Created = DateTime.Now
            };
        }
    }
}

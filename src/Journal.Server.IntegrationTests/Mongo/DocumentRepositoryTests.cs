using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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

            var result = await target.GetByIdAsync(doc.Id.ToString());
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
    }
}

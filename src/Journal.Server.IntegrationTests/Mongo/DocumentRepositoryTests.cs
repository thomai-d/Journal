using System;
using System.Collections.Generic;
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
                Content = "Hallo"
            };

            await target.AddAsync(doc);

            var result = await target.GetByIdAsync(doc.Id);
            result.Content.Should().Be(doc.Content);
        }
    }
}

using System;
using FluentAssertions;
using Journal.Server.Model;
using Xunit;

namespace Journal.Server.UnitTests.Model
{
    public class DocumentTest
    {
        [Fact]
        public void RebuildTags_Test()
        {
            var doc = new Document
            {
                Content = "#hallo das ist ein #test, der sollte #so-oder-so: funktionieren. #l�uft"
            };

            doc.RebuildTags();

            doc.Tags.Should().BeEquivalentTo("hallo", "test", "so-oder-so", "l�uft");
        }
    }
}

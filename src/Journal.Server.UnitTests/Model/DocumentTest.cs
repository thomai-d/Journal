using System;
using System.Collections.Generic;
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
                Content = "#hallo das ist ein #test, der sollte #so-oder-so: funktionieren. #läuft"
            };

            doc.RebuildTags();

            doc.Tags.Should().BeEquivalentTo("hallo", "test", "so-oder-so", "läuft");
        }
        
        [Fact]
        public void RebuildValues_Test()
        {
            var doc = new Document
            {
                Content = "#hallo $a=5 $b=hans $c='alles ok' ja? $wert1=5"
            };

            doc.RebuildValues();

            doc.Values.Should().BeEquivalentTo(new Dictionary<string, object>
            {
                { "a", 5.0 },
                { "b", "hans" },
                { "c", "alles ok" },
                { "wert1", 5.0 },
            });
        }
    }
}

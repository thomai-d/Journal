using System;
using System.Collections.Generic;
using System.Text;
using FluentAssertions;
using Journal.Server.Model;
using Xunit;

namespace Journal.Server.UnitTests.Model
{
    public class FilterStringParserTest
    {
        [Fact]
        public void Parser_Should_Parse_Tags()
        {
            new FilterStringParser().Parse("a b c")
                                    .Should().BeEquivalentTo(new FilterSettings("a", "b", "c"));
        }
        
        [Fact]
        public void Parser_Should_Parse_Values()
        {
            new FilterStringParser().Parse("$a $b $c")
                                    .Should().BeEquivalentTo(new FilterSettings(new string[0], new[] { "a", "b", "c" }));
        }
        
        [Fact]
        public void Parser_Should_Parse_Tags_And_Values()
        {
            new FilterStringParser().Parse("$a b $c")
                                    .Should().BeEquivalentTo(new FilterSettings(new[] { "b" }, new[] { "a", "c" }));
        }
    }
}

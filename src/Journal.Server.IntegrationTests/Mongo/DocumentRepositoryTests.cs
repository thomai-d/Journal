﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Journal.Server.Controllers.ApiModel;
using Journal.Server.DataAccess;
using Journal.Server.Model;
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
            
            var docs = await target.QueryAsync("test", 10, new FilterSettings("Hallo"));
            docs.Count.Should().BeInRange(3, 10);

            await target.DeleteAllDocumentsFromAuthorAsync("test");

            docs = await target.QueryAsync("test", 10, new FilterSettings("Hallo"));
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

            var docs = await target.QueryAsync("test", 10, new FilterSettings("a", "b"));
            docs.Count.Should().Be(2);
            
            docs = await target.QueryAsync("test", 1, new FilterSettings("a", "b"));
            docs.Count.Should().Be(1);
            
            docs = await target.QueryAsync("test", 10, new FilterSettings("b", "a"));
            docs.Count.Should().Be(2);
            
            docs = await target.QueryAsync("test", 10, new FilterSettings("f", "b"));
            docs.Count.Should().Be(0);
        }

        [Fact]
        public async Task Insert_Demo_Data()
        {
            var target = this.testHost.GetService<IDocumentRepository>();
            await target.DeleteAllDocumentsFromAuthorAsync("test");

            await target.AddAsync(CreateValidDoc(content: "#a #b $a=1", date: "2020-07-01"));
            await target.AddAsync(CreateValidDoc(content: "#a #b $a=2", date: "2020-07-02"));
            await target.AddAsync(CreateValidDoc(content: "#a #b $a=3", date: "2020-07-03"));
            await target.AddAsync(CreateValidDoc(content: "#a #b $a=4", date: "2020-07-04"));
            await target.AddAsync(CreateValidDoc(content: "#a #b $a=3", date: "2020-07-05"));
            await target.AddAsync(CreateValidDoc(content: "#a #b $a=2", date: "2020-07-06"));
            await target.AddAsync(CreateValidDoc(content: "#a #b $a=1", date: "2020-07-07"));
            await target.AddAsync(CreateValidDoc(content: "#a #b $a=0", date: "2020-07-08"));
        }

        [Fact]
        public async Task Aggregate_Sum_Tests()
        {
            var target = this.testHost.GetService<IDocumentRepository>();
            await target.DeleteAllDocumentsFromAuthorAsync("test");

            await target.AddAsync(CreateValidDoc(content: "#a #b $a=5", date: "2020-07-05"));
            await target.AddAsync(CreateValidDoc(content: "#b $a=3", date: "2020-07-06"));
            await target.AddAsync(CreateValidDoc(content: "#c $b=10", date: "2020-07-05"));

            (await target.AggregateValuesAsync("test", GroupTimeRange.Day, Aggregate.Sum, FilterSettings.Empty))
                .Should().BeEquivalentTo(new[]
                {
                    new ValuesResult { Key = "a", Values = new Dictionary<string, double>
                    {
                        { "2020-07-05", 5 },
                        { "2020-07-06", 3 },
                    }},
                    new ValuesResult { Key = "b", Values = new Dictionary<string, double>
                    {
                        { "2020-07-05", 10 },
                    }},
                });
            
            (await target.AggregateValuesAsync("test", GroupTimeRange.Month, Aggregate.Sum, FilterSettings.Empty))
                .Should().BeEquivalentTo(new[]
                {
                    new ValuesResult { Key = "a", Values = new Dictionary<string, double>
                    {
                        { "2020-07", 8 },
                    }},
                    new ValuesResult { Key = "b", Values = new Dictionary<string, double>
                    {
                        { "2020-07", 10 },
                    }},
                });
            
            (await target.AggregateValuesAsync("test", GroupTimeRange.Month, Aggregate.Sum, FilterSettings.FilterValues("a")))
                .Should().BeEquivalentTo(new[]
                {
                    new ValuesResult { Key = "a", Values = new Dictionary<string, double>
                    {
                        { "2020-07", 8 },
                    }}
                });
            
            (await target.AggregateValuesAsync("test", GroupTimeRange.Month, Aggregate.Sum, new FilterSettings("a", "b")))
                .Should().BeEquivalentTo(new[]
                {
                    new ValuesResult { Key = "a", Values = new Dictionary<string, double>
                    {
                        { "2020-07", 5 },
                    }}
                });
            
            (await target.AggregateValuesAsync("test", GroupTimeRange.Year, Aggregate.Sum, new FilterSettings("c")))
                .Should().BeEquivalentTo(new[]
                {
                    new ValuesResult { Key = "b", Values = new Dictionary<string, double>
                    {
                        { "2020", 10 },
                    }}
                });
        }
        
        [Fact]
        public async Task Aggregate_Avg_Tests()
        {
            var target = this.testHost.GetService<IDocumentRepository>();
            await target.DeleteAllDocumentsFromAuthorAsync("test");

            await target.AddAsync(CreateValidDoc(content: "#a #b $a=5", date: "2020-07-05"));
            await target.AddAsync(CreateValidDoc(content: "#b $a=3", date: "2020-07-06"));
            await target.AddAsync(CreateValidDoc(content: "#c $b=10", date: "2020-07-05"));

            (await target.AggregateValuesAsync("test", GroupTimeRange.Day, Aggregate.Average, FilterSettings.Empty))
                .Should().BeEquivalentTo(new[]
                {
                    new ValuesResult { Key = "a", Values = new Dictionary<string, double>
                    {
                        { "2020-07-05", 5 },
                        { "2020-07-06", 3 },
                    }},
                    new ValuesResult { Key = "b", Values = new Dictionary<string, double>
                    {
                        { "2020-07-05", 10 },
                    }},
                });
            
            (await target.AggregateValuesAsync("test", GroupTimeRange.Month, Aggregate.Average, FilterSettings.Empty))
                .Should().BeEquivalentTo(new[]
                {
                    new ValuesResult { Key = "a", Values = new Dictionary<string, double>
                    {
                        { "2020-07", 4 },
                    }},
                    new ValuesResult { Key = "b", Values = new Dictionary<string, double>
                    {
                        { "2020-07", 10 },
                    }},
                });
        }
        
        [Fact]
        public async Task Aggregate_Count_Tests()
        {
            var target = this.testHost.GetService<IDocumentRepository>();
            await target.DeleteAllDocumentsFromAuthorAsync("test");

            await target.AddAsync(CreateValidDoc(content: "#a #b $v=5", date: "2020-07-05"));
            await target.AddAsync(CreateValidDoc(content: "#a #c", date: "2020-07-05"));
            await target.AddAsync(CreateValidDoc(content: "#a #b", date: "2019-01-01"));
            
            (await target.AggregateCountAsync("test", GroupTimeRange.Day, FilterSettings.Empty))
                .Should().BeEquivalentTo(new[]
                {
                    new { Key = "2020-07-05", Value = 2 },
                    new { Key = "2019-01-01", Value = 1 }
                });
            
            (await target.AggregateCountAsync("test", GroupTimeRange.Week, FilterSettings.Empty))
                .Should().BeEquivalentTo(new[]
                {
                    new { Key = "27/2020", Value = 2 },
                    new { Key = "01/2019", Value = 1 }
                });

            (await target.AggregateCountAsync("test", GroupTimeRange.Month, FilterSettings.Empty))
                .Should().BeEquivalentTo(new[]
                {
                    new { Key = "2020-07", Value = 2 },
                    new { Key = "2019-01", Value = 1 }
                });
            
            (await target.AggregateCountAsync("test", GroupTimeRange.Year, FilterSettings.Empty))
                .Should().BeEquivalentTo(new[]
                {
                    new { Key = "2020", Value = 2 },
                    new { Key = "2019", Value = 1 }
                });
            (await target.AggregateCountAsync("test", GroupTimeRange.Year, new FilterSettings("a", "b")))
                .Should().BeEquivalentTo(new[]
                {
                    new { Key = "2020", Value = 1 },
                    new { Key = "2019", Value = 1 }
                });
            (await target.AggregateCountAsync("test", GroupTimeRange.Day, FilterSettings.FilterValues("v")))
                .Should().BeEquivalentTo(new[]
                {
                    new { Key = "2020-07-05", Value = 1 },
                });
        }

        private static Document CreateValidDoc(string content = "#Hallo wie gehts", string date = "2000-01-01")
        {
            return new Document
            {
                Content = content,
                Author = "test",
                Created = DateTime.Parse(date).ToLocalTime()
            };
        }
    }
}

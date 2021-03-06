﻿using System;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using System.Net;
using Newtonsoft.Json.Linq;
using Journal.Server.DataAccess;
using Journal.Server.Model;
using Microsoft.AspNetCore.Mvc.Core.Infrastructure;
using System.Linq;
using Xunit.Sdk;
using Journal.Server.Controllers.ApiModel;
using System.Collections.Generic;

namespace Journal.Server.IntegrationTests.Api
{
    public class ExploreControllerTests
    {
        private readonly IntegrationTestHost testHost;

        public ExploreControllerTests()
        {
            this.testHost = new IntegrationTestHost();
        }

        [Fact]
        public async Task Aggregate_Items_ByYear_And_Count_Test()
        {
            await this.testHost.DeleteDocumentsForAuthorAsync("test");
            await this.testHost.InsertDocumentsAsync("test", Doc("#a #b #c"), Doc("#a #b #d"));

            await this.testHost.PostAsync("/api/explore", new ExploreParameter { Aggregate = Aggregate.Count, GroupByTime = GroupTimeRange.Year })
                               .ShouldRepondWith(HttpStatusCode.Unauthorized);

            await this.testHost.LoginAsync();
            await this.testHost.PostAsync("/api/explore", new ExploreParameter { Aggregate = Aggregate.Count, GroupByTime = GroupTimeRange.Year })
                               .ShouldRepondWith(HttpStatusCode.OK)
                               .ShouldHaveContent<List<GroupResult>>(result =>
                               {
                                   result.Should().BeEquivalentTo(new[]
                                   {
                                       new GroupResult { Key = DateTime.Now.Year.ToString(), Value = 2 }
                                   });
                               });
        }
        
        private static Document Doc(string text)
        {
            return new Document
            {
                Author = "test",
                Content = text,
                Created = DateTime.Now
            };
        }
    }
}

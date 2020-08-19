using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Journal.Server.Controllers.ApiModel;
using Journal.Server.DataAccess;
using Journal.Server.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Journal.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/explore")]
    public class ExploreController : ControllerBase
    {
        private readonly IDocumentRepository docRepo;
        private readonly ILogger<ExploreController> logger;
        private readonly IFilterStringParser filterStringParser;

        public ExploreController(ILogger<ExploreController> logger, IDocumentRepository docRepo, IFilterStringParser filterStringParser)
        {
            this.logger = logger;
            this.docRepo = docRepo;
            this.filterStringParser = filterStringParser;
        }

        /// <summary>
        /// Queries the data.
        /// </summary>
        /// <response code="200">Returns explore result.</response>
        /// <example>
        /// >>> POST /api/explore
        /// {
        ///     aggregate: 'count',
        ///     groupByTime: 'month'
        /// }
        /// 200
        /// [
        ///     { key: '2020-07', value: 5 },
        ///     { key: '2020-06', value: 2 },
        /// ]
        /// </example>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> PostAsync([FromBody]ExploreParameter param)
        {
            param.Validate();

            var username = this.GetUserName();
            var filterSettings = this.filterStringParser.Parse(param.Filter);

            if (param.Aggregate == Aggregate.Count)
            {
                var result = await this.docRepo.AggregateCountAsync(username, param.GroupByTime, filterSettings);
                return this.Ok(result);
            }
            else if (param.Aggregate == Aggregate.Sum 
                  || param.Aggregate == Aggregate.Average)
            {
                var result = await this.docRepo.AggregateValuesAsync(username, param.GroupByTime, param.Aggregate, filterSettings);
                return this.Ok(result);
            }
            else throw new NotImplementedException("TODO");
        }
    }
}

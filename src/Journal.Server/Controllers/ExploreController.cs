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
        private readonly ILogger<ExploreController> logger;
        private readonly IDocumentRepository docRepo;

        public ExploreController(ILogger<ExploreController> logger, IDocumentRepository docRepo)
        {
            this.logger = logger;
            this.docRepo = docRepo;
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
            var result = await this.docRepo.AggregateAsync(username, param.GroupByTime, param.Aggregate);
            return this.Ok(result);
        }
    }
}

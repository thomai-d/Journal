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
    [Route("api/document")]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentRepository docRepo;
        private readonly ILogger<DocumentController> logger;
        private readonly IFilterStringParser filterStringParser;

        public DocumentController(ILogger<DocumentController> logger, IDocumentRepository docRepo, IFilterStringParser filterStringParser)
        {
            this.logger = logger;
            this.docRepo = docRepo;
            this.filterStringParser = filterStringParser;
        }

        /// <summary>
        /// Creates a new document.
        /// </summary>
        /// <response code="201">Returns the id of the newly created item</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<CreateDocumentResult>> PostAsync([FromBody]CreateDocumentParameter param)
        {
            var doc = new Document();
            doc.Content = param.Content;
            doc.Author = this.GetUserName();
            doc.Created = DateTime.Now;
            await this.docRepo.AddAsync(doc);
            this.logger.LogInformation("{user} created a new document: {documentId}", doc.Author, doc.Id.ToString());

            var url = $"/api/document/{doc.Id}";
            return this.Created(url, new CreateDocumentResult(doc.Id.ToString()));
        }

        /// <summary>
        /// Get a document by it's id.
        /// </summary>
        /// <response code="200">Returns the document</response>
        [HttpGet("{id}")]
        public async Task<ActionResult<Document>> GetAsync(string id)
        {
            var username = this.GetUserName();

            try
            {
                return await this.docRepo.GetByIdAsync(username, id);
            }
            catch (KeyNotFoundException)
            {
                this.logger.LogWarning("{user} requested nonexisting document {documentId}", username, id);
                return this.NotFound();
            }
        }

        /// <summary>
        /// Retrieves all documents matching the given filter.
        /// </summary>
        /// <response code="200">Returns all matched documents</response>
        [HttpPost("query")]
        public async Task<ActionResult<Document[]>> PostAsync([FromBody]DocumentQueryFilterParameter param)
        {
            var username = this.GetUserName();

            param.Normalize();
            var filterSettings = this.filterStringParser.Parse(param.Filter);
            var docs = await this.docRepo.QueryAsync(username, param.Limit, filterSettings);
            return docs.ToArray();
        }
    }
}

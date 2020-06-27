using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Journal.Server.DataAccess;
using Journal.Server.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Journal.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/document")]
    public class DocumentController : ControllerBase
    {
        private readonly ILogger<DocumentController> logger;
        private readonly IDocumentRepository docRepo;

        public DocumentController(ILogger<DocumentController> logger, IDocumentRepository docRepo)
        {
            this.logger = logger;
            this.docRepo = docRepo;
        }

        [HttpPost]
        public async Task<IActionResult> PostAsync([FromBody]Document doc)
        {
            doc.Author = this.GetUserName();
            doc.Created = DateTime.Now;
            await this.docRepo.AddAsync(doc);
            this.logger.LogInformation("{user} created a new document: {documentId}", doc.Author, doc.Id.ToString());

            var url = $"/api/document/{doc.Id}";
            return this.Created(url, new { id = doc.Id.ToString() });
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Document>> GetAsync(string id)
        {
            var username = this.GetUserName();

            try
            {
                var doc = await docRepo.GetByIdAsync(id);
                if (username != doc.Author)
                {
                    this.logger.LogWarning("{user} requested document {documentId} from {author}", username, id, doc.Author);
                    return this.NotFound();
                }

                return doc;
            }
            catch (KeyNotFoundException)
            {
                this.logger.LogWarning("{user} requested nonexisting document {documentId}", username, id);
                return this.NotFound();
            }
        }
    }
}

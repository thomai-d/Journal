using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Journal.Server.Controllers.ApiModel
{
    public class CreateDocumentResult
    {
        public CreateDocumentResult(string id)
        {
            this.Id = id;
        }

        public string Id { get; set; }
    }
}

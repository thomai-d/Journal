using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Journal.Server.Model;
using MongoDB.Bson;

namespace Journal.Server.DataAccess
{
    public interface IDocumentRepository
    {
        Task AddAsync(Document doc);

        Task<Document> GetByIdAsync(string id);

        Task<IEnumerable<Document>> FindByTag();
    }
}

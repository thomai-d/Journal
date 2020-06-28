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

        Task<Document> GetByIdAsync(string author, string id);

        Task<List<Document>> QueryAsync(string author, int limit, params string[] tags);

        Task DeleteAllDocumentsFromAuthorAsync(string author);
    }
}

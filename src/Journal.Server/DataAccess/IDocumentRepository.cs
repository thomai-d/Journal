using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Journal.Server.Controllers.ApiModel;
using Journal.Server.Model;

namespace Journal.Server.DataAccess
{
    public interface IDocumentRepository
    {
        Task AddAsync(Document doc);

        Task AddAsync(Document doc, Attachment[] attachments);

        Task<List<Attachment>> ReadAttachmentsAsync(string author, string documentId);

        Task<Document> GetByIdAsync(string author, string id);

        Task<List<Document>> QueryAsync(string author, int limit, FilterSettings filterSettings);

        Task DeleteAllDocumentsFromAuthorAsync(string author);

        Task<List<GroupResult>> AggregateCountAsync(string author, GroupTimeRange groupTimeRange, FilterSettings filterSettings);
        
        Task<List<ValuesResult>> AggregateValuesAsync(string author, GroupTimeRange groupTimeRange, Aggregate aggregation, FilterSettings filterSettings);
    }
}

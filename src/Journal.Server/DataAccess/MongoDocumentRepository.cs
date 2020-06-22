using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Journal.Server.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;
using Document = Journal.Server.Model.Document;

namespace Journal.Server.DataAccess
{
    public class MongoDocumentRepository : IDocumentRepository
    {
        private readonly MongoClient client;
        private readonly IMongoDatabase database;
        private readonly IMongoCollection<Document> documents;
        private readonly ILogger<MongoDocumentRepository> logger;

        public MongoDocumentRepository(ILogger<MongoDocumentRepository> logger, IOptions<MongoConfiguration> mongoOptions)
        {
            var config = mongoOptions.Value;
            config.Validate();

            this.client = new MongoClient(config.ConnectionString);
            this.database = client.GetDatabase(config.Database);
            this.documents = database.GetCollection<Document>("documents");
            this.logger = logger;
        }

        public async Task AddAsync(Document doc)
        {
            doc.Created = DateTime.Now;
            await this.documents.InsertOneAsync(doc);
            this.logger.LogInformation("Added document {docid}", doc.Id);
        }

        public Task<IEnumerable<Document>> FindByTag()
        {
            throw new NotImplementedException();
        }

        public async Task<Document> GetByIdAsync(ObjectId id)
        {
            return await this.documents.Find(new FilterDefinitionBuilder<Document>()
                                          .Where(d => d.Id == id))
                                          .Limit(2)
                                          .SingleAsync();
        }
    }
}

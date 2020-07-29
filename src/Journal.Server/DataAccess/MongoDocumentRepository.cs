using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Journal.Server.Controllers.ApiModel;
using Journal.Server.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using Document = Journal.Server.Model.Document;

namespace Journal.Server.DataAccess
{
    public class MongoDocumentRepository : IDocumentRepository
    {
        private const string DocumentCollection = "documents";

        private readonly MongoClient client;
        private readonly IMongoDatabase database;
        private readonly IMongoCollection<Document> documents;
        private readonly ILogger<MongoDocumentRepository> logger;

        private readonly FilterDefinitionBuilder<Document> filterBuilder = new FilterDefinitionBuilder<Document>();

        public MongoDocumentRepository(ILogger<MongoDocumentRepository> logger, IOptions<MongoConfiguration> mongoOptions)
        {
            var config = mongoOptions.Value;
            config.Validate();

            this.client = new MongoClient(config.ConnectionString);
            this.database = client.GetDatabase(config.Database);
            this.documents = database.GetCollection<Document>(DocumentCollection);
            this.logger = logger;
        }

        public async Task AddAsync(Document doc)
        {
            doc.Validate();
            doc.RebuildTags();
            doc.RebuildValues();
            await this.documents.InsertOneAsync(doc);
            this.logger.LogInformation("Added document {docid}", doc.Id);
        }

        public async Task<List<Document>> QueryAsync(string author, int limit, params string[] tags)
        {
            var filter = this.filterBuilder.Empty;
            if (tags.Length > 0)
            {
                filter = filterBuilder.All(doc => doc.Tags, tags);
            }

            var doc = await this.GetDocumentsForUserAsync(author, filter, limit);
            return doc.OrderByDescending(d => d.Created).ToList();
        }

        public async Task<Document> GetByIdAsync(string author, string id)
        {
            if (!ObjectId.TryParse(id, out var idObj))
                throw new KeyNotFoundException($"ObjectId {id} is not valid");

            var docs = await this.GetDocumentsForUserAsync(author, this.filterBuilder.Where(doc => doc.Id == id), limit: 2);
            if (docs.Count != 1)
                throw new KeyNotFoundException($"{id} does not exist in {DocumentCollection}");

            var doc = docs.Single();
            doc.Created = doc.Created.ToLocalTime();
            return doc;
        }

        public async Task DeleteAllDocumentsFromAuthorAsync(string author)
        {
            var builder = new FilterDefinitionBuilder<Document>();
            await this.documents.DeleteManyAsync(builder.Empty);
        }

        public async Task<List<GroupResult>> AggregateAsync(string author, GroupTimeRange groupTimeRange, Aggregate aggregate, params string[] tags)
        {
            var dateFormat = groupTimeRange switch
            {
                GroupTimeRange.Day => "%Y-%m-%d",
                GroupTimeRange.Week => "%V/%Y",
                GroupTimeRange.Month => "%Y-%m",
                GroupTimeRange.Year => "%Y",
                _ => throw new NotSupportedException($"{groupTimeRange} is not supported."),
            };
            
            var filter = this.filterBuilder.Empty;
            if (tags.Length > 0)
                filter = this.filterBuilder.All(doc => doc.Tags, tags);
            var userFilter = this.filterBuilder.Where(d => d.Author == author);
            var rootFilter = this.filterBuilder.And(userFilter, filter);

            var aggregateResult = this.documents.Aggregate()
                                    .Match(rootFilter)
                                    .Group(new BsonDocument
                                    {
                                        { "_id", new BsonDocument
                                            {
                                                { "$dateToString", new BsonDocument
                                                    {
                                                        { "format", dateFormat },
                                                        { "date", "$Created" },
                                                        { "timezone", "Europe/Berlin" }
                                                    }
                                                }
                                            }
                                        },
                                        { "count", new BsonDocument
                                            {
                                                {  "$sum", 1 }
                                            }
                                        }
                                    })
                                    .Project(new BsonDocument
                                             {
                                                 { "_id", 0 },
                                                 { "Key", "$_id" },
                                                 { "Value", "$count" }
                                             })
                                    .Sort(new BsonDocument { { "Key", -1 } });

            var bsonResult = await aggregateResult.ToListAsync();
            var result = bsonResult.Select(doc => BsonSerializer.Deserialize<GroupResult>(doc))
                                   .ToList();

            return result;
        }

        private async Task<List<Document>> GetDocumentsForUserAsync(string author, FilterDefinition<Document> filter, int limit)
        {
            var watch = Stopwatch.StartNew();
            var userFilter = this.filterBuilder.Where(d => d.Author == author);
            var rootFilter = this.filterBuilder.And(userFilter, filter);
            var opt = new FindOptions<Document> { Limit = limit };
            var cursor = await this.documents.FindAsync(rootFilter, opt);
            var result = await cursor.ToListAsync();
            watch.Stop();

            this.logger.LogDebug("Find took {ms}ms. Query: {query}", watch.ElapsedMilliseconds, rootFilter.FilterToString());
            return result;
        }
    }
}

﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
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
            await this.documents.InsertOneAsync(doc);
            this.logger.LogInformation("Added document {docid}", doc.Id);
        }

        public async Task<List<Document>> GetByTagsAsync(string author, int limit, params string[] tags)
        {
            var doc = await this.GetDocumentsForUserAsync(author, filter => filter.All(doc => doc.Tags, tags), limit);
            return doc;
        }

        public async Task<Document> GetByIdAsync(string author, string id)
        {
            if (!ObjectId.TryParse(id, out var idObj))
                throw new KeyNotFoundException($"ObjectId {id} is not valid");

            var docs = await this.GetDocumentsForUserAsync(author, filter => filter.Where(doc => doc.Id == id), limit: 2);
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

        private async Task<List<Document>> GetDocumentsForUserAsync(string author, Func<FilterDefinitionBuilder<Document>, FilterDefinition<Document>> filter, int limit)
        {
            var watch = Stopwatch.StartNew();
            var builder = new FilterDefinitionBuilder<Document>();
            var filterWithUserRestriction = builder.And(
                                                     filter(builder),
                                                     builder.Where(d => d.Author == author));

            var opt = new FindOptions<Document> { Limit = limit };
            var cursor = await this.documents.FindAsync(filterWithUserRestriction, opt);
            var result = await cursor.ToListAsync();
            watch.Stop();

            this.logger.LogDebug("Find took {ms}ms. Query: {query}", watch.ElapsedMilliseconds, filterWithUserRestriction.FilterToString());
            return result;
        }
    }
}

﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Journal.Server.Controllers.ApiModel;
using Journal.Server.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using MongoDB.Driver.Core.Events;
using Document = Journal.Server.Model.Document;

namespace Journal.Server.DataAccess
{
    public class MongoDocumentRepository : IDocumentRepository
    {
        private const string DocumentCollection = "documents";
        private const string AttachmentCollection = "attachments";

        private readonly MongoClient client;
        private readonly IMongoDatabase database;
        private readonly IMongoCollection<Document> documentCollection;
        private readonly IMongoCollection<Attachment> attachmentCollection;
        private readonly ILogger<MongoDocumentRepository> logger;

        private readonly FilterDefinitionBuilder<Document> filterBuilder = new FilterDefinitionBuilder<Document>();

        public MongoDocumentRepository(ILogger<MongoDocumentRepository> logger, IOptions<MongoConfiguration> mongoOptions)
        {
            var config = mongoOptions.Value;
            config.Validate();

            var settings = MongoClientSettings.FromConnectionString(config.ConnectionString);

            if (logger.IsEnabled(LogLevel.Debug))
            {
                settings.ClusterConfigurator = builder =>
                {
                    builder.Subscribe<CommandStartedEvent>(e =>
                    {
                        var cmdJson = e.Command.ToJson();
                        this.logger.LogDebug("Executing command: {command}", cmdJson);
                    });
                };
            }

            this.client = new MongoClient(settings);
            this.database = client.GetDatabase(config.Database);
            this.documentCollection = database.GetCollection<Document>(DocumentCollection);
            this.attachmentCollection = database.GetCollection<Attachment>(AttachmentCollection);
            this.logger = logger;
        }

        public Task AddAsync(Document doc)
        {
            return this.AddAsync(doc, Array.Empty<Attachment>());
        }

        public async Task<List<Attachment>> ReadAttachmentsAsync(string author, string documentId)
        {
            var document = await this.documentCollection.Find(doc => doc.Id == documentId && doc.Author == author)
                                                  .SingleOrDefaultAsync();

            if (document == null)
                throw new KeyNotFoundException($"Document {documentId} is not valid");

            return await this.attachmentCollection.Find(att => att.DocumentId == document.Id)
                                                  .ToListAsync();
        }

        public async Task<Attachment> ReadAttachmentAsync(string author, string documentId, string attachmentId)
        {
            var attachment = await this.attachmentCollection.Find(att => att.DocumentId == documentId && att.Id == attachmentId && att.Author == author)
                                                  .SingleOrDefaultAsync();
            if (attachment == null)
                throw new KeyNotFoundException($"Attachment {attachmentId} is not valid.");

            return attachment;
        }

        public async Task AddAsync(Document doc, Attachment[] attachments)
        {
            doc.Validate();
            doc.RebuildTags();
            doc.RebuildValues();
            await this.documentCollection.InsertOneAsync(doc);
            this.logger.LogInformation("Added document {docid}", doc.Id);

            if (attachments.Length > 0)
            {
                foreach (var attachment in attachments)
                {
                    attachment.DocumentId = doc.Id;
                    attachment.Author = doc.Author;
                }

                await this.attachmentCollection.InsertManyAsync(attachments);
                this.logger.LogInformation("Added {attachments} for document {docid}", attachments.Length, doc.Id);
            }
        }

        public async Task<List<Document>> QueryAsync(string author, int limit, FilterSettings filterSettings)
        {
            var matchStage = this.BuildMatchStage(author, filterSettings);
            var doc = await this.GetDocumentsAsync(matchStage, limit);
            return doc.OrderByDescending(d => d.Created).ToList();
        }

        public async Task<Document> GetDocumentByIdAsync(string author, string id)
        {
            if (!ObjectId.TryParse(id, out var idObj))
                throw new KeyNotFoundException($"ObjectId {id} is not valid");

            var docs = await this.GetDocumentsAsync(this.filterBuilder.Where(doc => doc.Id == id && doc.Author == author), limit: 2);
            if (docs.Count != 1)
                throw new KeyNotFoundException($"{id} does not exist in {DocumentCollection}");

            var attachments = await this.attachmentCollection.Find(a => a.DocumentId == id)
                                                             .Project(a => new AttachmentPreview(a.Id, a.FileName))
                                                             .ToListAsync();
            var doc = docs.Single();
            doc.Created = doc.Created.ToLocalTime();
            doc.Attachments = attachments;
            return doc;
        }

        public async Task DeleteAllDocumentsFromAuthorAsync(string author)
        {
            var documentIds = await this.documentCollection.Find(doc => doc.Author == author)
                                                           .Project(doc => doc.Id)
                                                           .ToListAsync();
            var docBuilder = new FilterDefinitionBuilder<Document>();
            var attachmentBuilder = new FilterDefinitionBuilder<Attachment>();
            foreach (var documentId in documentIds)
            {
                var filter = attachmentBuilder.Where(a => a.DocumentId == documentId);
                await this.attachmentCollection.DeleteManyAsync(filter);
                await this.documentCollection.DeleteOneAsync(doc => doc.Id == documentId);
            }
        }

        public async Task<List<ValuesResult>> AggregateValuesAsync(string author, GroupTimeRange groupTimeRange, Aggregate aggregation, FilterSettings filterSettings)
        {
            /*
                db.getCollection('documents').aggregate([
                    { "$match" : { "Author" : "test" } }, 
                    { "$project" : { "date" : { "$dateToString" : { "format" : "%Y-%m-%d", "date" : "$Created", "timezone" : "Europe/Berlin" } }, "values" : { "$objectToArray" : "$Values" } } }, 
                    { "$unwind" : "$values" }, 
                    { "$group" : { "_id" : { "date" : "$date", "key" : "$values.k" }, "value" : { "$sum" : "$values.v" } } }, 
                    { "$group" : { "_id" : "$_id.key", "values" : { "$push" : { "$arrayToObject" : [[{ "k" : "$_id.date", "v" : "$value" }]] } } } },
                    { "$project": { "key": "$_id", "values": 1, "_id": 0 } }
                ])
             * */

            var projectStage = new BsonDocument
                {
                    { "date", MongoOp.DateToString("Created", groupTimeRange) },
                    { "values", new BsonDocument { { "$objectToArray", "$Values" } } }
                };

            var aggregationOp = aggregation switch
            {
                Aggregate.Sum => "$sum",
                Aggregate.Average => "$avg",
                _ => throw new InvalidOperationException($"{aggregation} not supported")
            };

            var groupByDateAndKey = new BsonDocument
            {
                { "_id", new BsonDocument { { "date", "$date" }, { "key", "$values.k" } } },
                { "value", new BsonDocument { { aggregationOp, "$values.v" } } }
            };

            var groupByDateOnly = new BsonDocument
            {
                { "_id", "$_id.key" },
                { "Values", new BsonDocument { { "$push", new BsonDocument { { "$arrayToObject", new BsonArray { new BsonArray { new BsonDocument { { "k", "$_id.date" }, { "v", "$value" } } } } } } } } }
            };

            var jssson = groupByDateOnly.ToJson();

            var endProjectStage = new BsonDocument
                {
                    { "Key", "$_id" },
                    { "Values", 1 },
                    { "_id", 0 },
                };

            var watch = Stopwatch.StartNew();
            var aggregateResult = this.documentCollection.Aggregate()
                                    .Match(this.BuildMatchStage(author, filterSettings))
                                    .Project(projectStage)
                                    .Unwind("values")
                                    .Group(groupByDateAndKey)
                                    .Group(groupByDateOnly)
                                    .Project(endProjectStage);

            var bsonResult = await aggregateResult.ToListAsync();
            var result = bsonResult.Select(doc => BsonSerializer.Deserialize<ValuesResult>(doc))
                                   .ToList();
            watch.Stop();

            if (this.logger.IsEnabled(LogLevel.Debug))
            {
                this.logger.LogDebug("Explore took {ms}ms.", watch.ElapsedMilliseconds);
            }

            return result;
        }

        public async Task<List<GroupResult>> AggregateCountAsync(string author, GroupTimeRange groupTimeRange, FilterSettings filterSettings)
        {
            /*
             { "$match" : { "Author" : "test" } },
             { "$group" : { "_id" : { "$dateToString" : { "format" : "%Y-%m-%d", "date" : "$Created", "timezone" : "Europe/Berlin" } }, "count" : { "$sum" : 1 } } },
             { "$project" : { "_id" : 0, "Key" : "$_id", "Value" : "$count" } },
             { "$sort" : { "Key" : 1 } }
            */

            var projectStage = new BsonDocument
                                             {
                                                 { "_id", 0 },
                                                 { "Key", "$_id" },
                                                 { "Value", "$count" }
                                             };

            var watch = Stopwatch.StartNew();
            var aggregateResult = this.documentCollection.Aggregate()
                                    .Match(this.BuildMatchStage(author, filterSettings))
                                    .Group(MongoOp.GroupByDate("$Created", groupTimeRange, MongoOp.Count("count")))
                                    .Project(projectStage)
                                    .Sort(MongoOp.SortBy("Key", asc: true));

            var bsonResult = await aggregateResult.ToListAsync();
            var result = bsonResult.Select(doc => BsonSerializer.Deserialize<GroupResult>(doc))
                                   .ToList();
            watch.Stop();

            if (this.logger.IsEnabled(LogLevel.Debug))
            {
                this.logger.LogDebug("Explore took {ms}ms.", watch.ElapsedMilliseconds);
            }

            return result;
        }

        private async Task<List<Document>> GetDocumentsAsync(FilterDefinition<Document> filter, int limit)
        {
            var watch = Stopwatch.StartNew();
            var opt = new FindOptions<Document> { Limit = limit };
            var cursor = await this.documentCollection.FindAsync(filter, opt);
            var result = await cursor.ToListAsync();
            watch.Stop();

            this.logger.LogDebug("Find took {ms}ms. Query: {query}", watch.ElapsedMilliseconds, filter.FilterToString());
            return result;
        }

        private FilterDefinition<Document> BuildMatchStage(string author, FilterSettings filterSettings)
        {
            var filterList = new List<FilterDefinition<Document>>();
            filterList.Add(this.filterBuilder.Where(d => d.Author == author));

            if (filterSettings.Tags.Any())
                filterList.Add(this.filterBuilder.All(doc => doc.Tags, filterSettings.Tags));

            if (filterSettings.Values.Any())
            {
                var valueFilter = filterSettings.Values.Select(v => MongoOp.Exists($"Values.{v}"));
                filterList.Add(new BsonDocument() { { "$or", new BsonArray(valueFilter) } });
            }

            var matchStage = this.filterBuilder.And(filterList);
            return matchStage;
        }
    }
}

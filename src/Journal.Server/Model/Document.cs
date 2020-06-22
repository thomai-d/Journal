using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Journal.Server.Model
{
    public class Document
    {
        [BsonId]
        public ObjectId Id { get; set; }

        public string Author { get; set; }

        public string Content { get; set; }

        public List<string> Tags { get; set; } = new List<string>();

        public DateTime Created { get; set; }
    }
}

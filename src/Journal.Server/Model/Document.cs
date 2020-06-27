using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Journal.Server.Model
{
    public class Document
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [JsonProperty(Required = Required.DisallowNull)]
        public string Id { get; set; }

        [JsonProperty(Required = Required.DisallowNull)]
        public string Author { get; set; }

        [JsonProperty(Required = Required.DisallowNull)]
        public string Content { get; set; }

        [JsonProperty(Required = Required.DisallowNull)]
        public List<string> Tags { get; set; } = new List<string>();

        [JsonProperty(Required = Required.DisallowNull)]
        public DateTime Created { get; set; }

        public void Validate()
        {
            if (string.IsNullOrEmpty(this.Author))
                throw new ValidationException($"{nameof(this.Author)} is not set");
            if (string.IsNullOrEmpty(this.Content))
                throw new ValidationException($"{nameof(this.Content)} is not set");
            if (this.Created == DateTime.MinValue)
                throw new ValidationException($"{nameof(this.Created)} is not set");
        }

        public void RebuildTags()
        {
            var rx = new Regex("#[A-Za-z_\\-À-ž]+");
            var matches = rx.Matches(this.Content);
            this.Tags = matches.Select(m => m.Value.Substring(1)).ToList();
        }
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace Journal.Server.Model
{
    /// <summary>
    /// Represents a single document.
    /// </summary>
    public class Document
    {
        public Document()
        {
        }

        public Document(string author, string content)
        {
            this.Content = content;
            this.Author = author;
        }

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [JsonProperty(Required = Required.DisallowNull)]
        public string Id { get; set; }

        /// <summary>
        /// Gets or sets the document's author. This property is set by the controller to the user's name and must never change.
        /// </summary>
        [JsonProperty(Required = Required.DisallowNull)]
        public string Author { get; set; }

        /// <summary>
        /// Gets or sets the document's content.
        /// </summary>
        [JsonProperty(Required = Required.DisallowNull)]
        public string Content { get; set; }

        /// <summary>
        /// Gets or sets the document's tags used for fast searching (indexed).
        /// </summary>
        [JsonProperty(Required = Required.DisallowNull)]
        public List<string> Tags { get; set; } = new List<string>();
        
        /// <summary>
        /// Gets or sets the document's values.
        /// </summary>
        [JsonProperty(Required = Required.DisallowNull)]
        public Dictionary<string, object> Values { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// Gets or sets the document's creation date. This property is set by the controller upon creation and must never change.
        /// </summary>
        [JsonProperty(Required = Required.DisallowNull)]
        public DateTime Created { get; set; }

        /// <summary>
        /// Gets attachments. This list is only filled when rehydrated from the database.
        /// </summary>
        public List<AttachmentPreview> Attachments { get; set; } = new List<AttachmentPreview>();

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

        public void RebuildValues()
        {
            object getValue(string valueStr)
            {
                var isDouble = double.TryParse(valueStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var valueDouble);
                return isDouble ? (object)valueDouble : valueStr;
            }

            var rx = new Regex(@"\$(?<KEY>[A-Za-z_\-À-ž0-9]+)=(('(?<VALUE2>.+?)')|((?<VALUE1>.+?)(\s|$)))");
            var matches = rx.Matches(this.Content);
            this.Values = (from match in matches
                           let key = match.Groups["KEY"].Value
                           let valueStr = match.Groups["VALUE2"].Success ? match.Groups["VALUE2"].Value : match.Groups["VALUE1"].Value
                           let value = getValue(valueStr)
                           select new { key, value })
                           .ToDictionary(i => i.key, i => i.value);
        }
    }
}

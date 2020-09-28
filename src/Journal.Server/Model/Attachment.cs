using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Journal.Server.Model
{
    /// <summary>
    /// Represents a <see cref="Document"/>'s attachment.
    /// </summary>
    public class Attachment
    {
        public Attachment()
        {
        }

        public Attachment(string filename, string content, string contentType)
        {
            this.FileName = filename;
            this.Content = Encoding.UTF8.GetBytes(content);
            this.ContentType = contentType;
        }
        
        public Attachment(string filename, byte[] content, string contentType)
        {
            this.FileName = filename;
            this.Content = content;
            this.ContentType = contentType;
        }

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string DocumentId { get; set; }

        /// <summary>
        /// Gets or sets the author of the attachment. This value is automatically updated on persistency.
        /// </summary>
        public string Author { get; set; }

        /// <summary>
        /// Gets or sets the attachment's original filename.
        /// </summary>
        public string FileName { get; set; }
        
        /// <summary>
        /// Gets or sets the attachment's original content type.
        /// </summary>
        public string ContentType { get; set; }
        
        public byte[] Content { get; set; }
    }
}

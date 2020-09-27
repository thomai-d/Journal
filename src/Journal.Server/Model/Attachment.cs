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
    public class Attachment
    {
        public Attachment()
        {
        }

        public Attachment(string filename, string content)
        {
            this.FileName = filename;
            this.Content = Encoding.UTF8.GetBytes(content);
        }

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string DocumentId { get; set; }

        public string FileName { get; set; }
        
        public byte[] Content { get; set; }
    }
}

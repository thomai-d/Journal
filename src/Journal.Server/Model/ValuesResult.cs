using System;
using System.Collections.Generic;
using System.Linq;
using Journal.Server.Model.CustomSerializers;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Attributes;

namespace Journal.Server.Model
{
    public class ValuesResult
    {
        public string Key { get; set; }

        [BsonSerializer(typeof(DoubleValuesDictionarySerializer))]
        public Dictionary<string, double> Values { get; set; } = new Dictionary<string, double>();
    }
}

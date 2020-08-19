using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace Journal.Server.Model.CustomSerializers
{
    public class DoubleValuesDictionarySerializer : SerializerBase<Dictionary<string, double>>
    {
        private INameDecoder nameDecoder = new Utf8NameDecoder();

        public override Dictionary<string, double> Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
        {
            var dict = new Dictionary<string, double>();
            context.Reader.ReadStartArray();

            while (context.Reader.ReadBsonType() != BsonType.EndOfDocument)
            {
                context.Reader.ReadStartDocument();
                var key = context.Reader.ReadName(this.nameDecoder);
                var value = context.Reader.ReadDouble();
                context.Reader.ReadEndDocument();
                dict.Add(key, value);
            }

            context.Reader.ReadEndArray();
            return dict;
        }
    }
}

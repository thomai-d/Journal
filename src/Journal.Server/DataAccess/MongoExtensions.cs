using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace Journal.Server.DataAccess
{
    public static class MongoExtensions
    {
        public static string FilterToString<T>(this FilterDefinition<T> filter)
        {
            var serializerRegistry = BsonSerializer.SerializerRegistry;
            var documentSerializer = serializerRegistry.GetSerializer<T>();
            var bson = filter.Render(documentSerializer, serializerRegistry);
            return bson.ToString();
        }
    }
}

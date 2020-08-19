using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Journal.Server.Controllers.ApiModel;
using MongoDB.Bson;

namespace Journal.Server.DataAccess
{
    public static class MongoOp
    {
        public static string TimeZone = "Europe/Berlin";

        public static BsonDocument Exists(string path)
        {
            return new BsonDocument(path, new BsonDocument("$exists", true));
        }
        
        public static BsonDocument DateToString(string path, GroupTimeRange timeRange)
        {
            string dateFormat = GetDateFormat(timeRange);
            return new BsonDocument
            {
                { "$dateToString", new BsonDocument
                    {
                        { "format", dateFormat },
                        { "date", $"${path}" },
                        { "timezone", TimeZone }
                    }
                }
            };
        }

        public static BsonDocument GroupByDate(string path, GroupTimeRange timeRange, params BsonElement[] props)
        {
            string dateFormat = GetDateFormat(timeRange);

            var doc = new BsonDocument
                                    {
                                        { "_id", new BsonDocument
                                            {
                                                { "$dateToString", new BsonDocument
                                                    {
                                                        { "format", dateFormat },
                                                        { "date", path },
                                                        { "timezone", TimeZone }
                                                    }
                                                }
                                            }
                                        }
                                    };

            doc.AddRange(props);
            return doc;
        }

        public static BsonElement Count(string path)
        {
            return new BsonElement(path, new BsonDocument { {  "$sum", 1 } } );
        }

        public static BsonDocument SortBy(string path, bool asc = true)
        {
            return asc
                 ? new BsonDocument(path, 1)
                 : new BsonDocument(path, -1);
        }

        private static string GetDateFormat(GroupTimeRange timeRange)
        {
            return timeRange switch
            {
                GroupTimeRange.Day => "%Y-%m-%d",
                GroupTimeRange.Week => "%V/%Y",
                GroupTimeRange.Month => "%Y-%m",
                GroupTimeRange.Year => "%Y",
                _ => throw new NotSupportedException($"{timeRange} is not supported."),
            };
        }
    }
}

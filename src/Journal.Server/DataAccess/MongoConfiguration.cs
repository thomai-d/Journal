using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Journal.Server.DataAccess
{
    public class MongoConfiguration
    {
        public string ConnectionString { get; set; }

        public string Database { get; set; }

        public void Validate()
        {
            if (string.IsNullOrEmpty(this.ConnectionString))
                throw new InvalidOperationException($"{nameof(MongoConfiguration)}.{nameof(this.ConnectionString)} is empty");
            if (string.IsNullOrEmpty(this.Database))
                throw new InvalidOperationException($"{nameof(MongoConfiguration)}.{nameof(this.Database)} is empty");
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;

namespace Journal.Server.Model
{
    public class FilterSettings
    {
        public FilterSettings(params string[] tags)
        {
            this.Tags = tags.ToArray();
            this.Values = Array.Empty<string>();
        }

        public FilterSettings(IEnumerable<string> tags, IEnumerable<string> values)
        {
            this.Tags = tags.ToArray();
            this.Values = values.ToArray();
        }

        public static FilterSettings FilterValues(params string[] values)
        {
            return new FilterSettings(Array.Empty<string>(), values);
        }

        public static readonly FilterSettings Empty = new FilterSettings(Array.Empty<string>(), Array.Empty<string>());

        public string[] Tags { get; }
        
        public string[] Values { get; }
    }
}

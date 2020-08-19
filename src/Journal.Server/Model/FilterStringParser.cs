using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Journal.Server.Model
{
    public interface IFilterStringParser
    {
        FilterSettings Parse(string filterString);
    }

    public class FilterStringParser : IFilterStringParser
    {
        public FilterSettings Parse(string filterString)
        {
            var parts = filterString.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var tags = parts.Where(p => !p.StartsWith("$"));
            var values = parts.Where(p => p.StartsWith("$")).Select(p => p.Substring(1));
            return new FilterSettings(tags, values);
        }
    }
}

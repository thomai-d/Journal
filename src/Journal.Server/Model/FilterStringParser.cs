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
            return new FilterSettings(parts);
        }
    }
}

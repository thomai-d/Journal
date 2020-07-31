using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Journal.Server.Model
{
    public class FilterSettings
    {
        public FilterSettings(params string[] mustHaveTags)
        {
            this.MustHaveTags = mustHaveTags;
        }

        public static readonly FilterSettings Empty = new FilterSettings();

        public string[] MustHaveTags { get; }
    }
}

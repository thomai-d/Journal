using System;
using System.Collections.Generic;
using System.Linq;

namespace Journal.Server.Controllers.ApiModel
{
    public enum Aggregate
    {
        Undefined,

        Count
    }

    public enum GroupTimeRange
    {
        Undefined,
        Day,
        Week,
        Month,
        Year
    }

    public class ExploreParameter
    {
        public string Filter { get; set; } = string.Empty;

        public Aggregate Aggregate { get; set; }

        public GroupTimeRange GroupByTime { get; set; }

        public void Validate()
        {
            if (this.Aggregate == Aggregate.Undefined)
                throw new ArgumentException($"{nameof(this.Aggregate)} is not set");
            if (this.GroupByTime == GroupTimeRange.Undefined)
                throw new ArgumentException($"{nameof(this.GroupByTime)} is not set");
        }
    }
}

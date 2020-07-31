using System;
using System.Collections.Generic;

namespace Journal.Server.Controllers.ApiModel
{
    public class DocumentQueryFilterParameter
    {
        public string Filter { get; set; } = string.Empty;

        public int Limit { get; set; } = 30;

        public void Normalize()
        {
            if (this.Limit > 100)
                this.Limit = 100;
        }
    }
}

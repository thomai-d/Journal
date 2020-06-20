using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Journal.Server.IntegrationTests
{
    public static class IntegrationTestExtensions
    {
        public static async Task<T> As<T>(this HttpResponseMessage response)
        {
            response.EnsureSuccessStatusCode();
            var str = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(str);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using FluentAssertions.Execution;
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

        public static async Task<HttpResponseMessage> ShouldRepondWith(this Task<HttpResponseMessage> responseTask, HttpStatusCode code)
        {
            var response = await responseTask;
            response.StatusCode.Should().Be(code);
            return response;
        }
        
        public static async Task<HttpResponseMessage> ShouldHaveContent<T>(this Task<HttpResponseMessage> responseTask, Action<T> predicate)
        {
            var response = await responseTask;
            var str = await response.Content.ReadAsStringAsync();
            var obj = JsonConvert.DeserializeObject<T>(str);
            predicate(obj);
            return response;
        }

        public static async Task ShouldThrow<T>(this Task t)
        {
            try
            {
                await t;
            }
            catch (Exception ex)
            {
                if (ex.GetType() == typeof(T))
                    return;

                throw new AssertionFailedException($"Expected {typeof(T).Name} but got {ex.GetType().Name}");
            }

            throw new AssertionFailedException($"Expected {typeof(T).Name} but no exception was thrown");
        }
    }
}

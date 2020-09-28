using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Journal.Server.Controllers
{
    public static class ControllerExtensions
    {
        private const string UsernameClaim = "preferred_username";

        public static string GetUserName(this ControllerBase controller)
        {
            var claim = controller.User.Claims.SingleOrDefault(c => c.Type == UsernameClaim);
            if (claim == null || string.IsNullOrEmpty(claim.Value))
                throw new InvalidOperationException($"'{UsernameClaim}' is not present");
            return claim.Value;
        }

        public static async Task<byte[]> GetBytesAsync(this IFormFile file)
        {
            using var mem = new MemoryStream();
            await file.CopyToAsync(mem);
            var data = new byte[mem.Length];
            mem.Seek(0, SeekOrigin.Begin);
            await mem.ReadAsync(data, 0, (int)mem.Length);
            return data;
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
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
    }
}

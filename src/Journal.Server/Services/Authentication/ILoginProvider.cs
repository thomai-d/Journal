using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Journal.Server.Services.Authentication
{
    public interface ILoginProvider
    {
        Task<LoginResult> LoginAsync(string username, string password);
    }
}

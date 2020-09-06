using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Journal.Server.Services.Authentication
{
    public interface ILoginProvider
    {
        Task<Tokens> LoginAsync(string username, string password);

        Task<Tokens> RefreshTokenAsync(string refreshToken);
    }
}

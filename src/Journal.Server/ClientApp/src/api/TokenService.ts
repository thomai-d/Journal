import axios from 'axios';
import jwt_decode from 'jwt-decode';

export interface Tokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

interface AccessToken {
  preferred_username: string;
  exp: number;
}

interface RefreshToken {
  exp: number;
}

class _TokenService {

  private tokens?: Tokens;
  private accessToken?: AccessToken;
  private refreshToken?: RefreshToken;

  setTokens(tokens: Tokens) {
    if (!tokens || !tokens.accessToken || !tokens.refreshToken)
      throw new Error('Missing tokens: ' + JSON.stringify(tokens));

    const accessToken = jwt_decode(tokens.accessToken) as AccessToken;
    const refreshToken = jwt_decode(tokens.refreshToken) as RefreshToken;

    const accessTokenExpiry = new Date(accessToken.exp * 1000);
    const refreshTokenExpiry = new Date(refreshToken.exp * 1000);
    console.log(`${accessToken.preferred_username} logged in `);
    console.log(`Login token valid until ${accessTokenExpiry}`);
    console.log(`Refresh token valid until ${refreshTokenExpiry}`);
    console.log(tokens.refreshToken);

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    axios.defaults.headers.common = { 'Authorization': `bearer ${tokens.accessToken}` };
  }

  clearTokens() {
    axios.defaults.headers.common = { };
  }

  getUsername(): string {
    return this.accessToken!.preferred_username;
  }
}

export const TokenService = new _TokenService();
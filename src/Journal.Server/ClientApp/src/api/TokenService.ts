import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { appConfig } from '../appConfig';
import { logger } from '../util/logger';

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
    logger.info(`${accessToken.preferred_username} logged in `);
    logger.debug(`Login token valid until ${accessTokenExpiry}`);
    logger.debug(`Refresh token valid until ${refreshTokenExpiry}`);

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokens = tokens;
    axios.defaults.headers.common = { 'Authorization': `bearer ${tokens.accessToken}` };
  }

  clearTokens() {
    axios.defaults.headers.common = { };
  }

  getUsername(): string {
    return this.accessToken!.preferred_username;
  }

  isLoggedIn(): boolean {
    return !!this.tokens;
  }

  accessTokenNeedsRefresh(): boolean {
    if (!this.accessToken)
      throw new Error('No access token present');

    const accessTokenExpiry = new Date(this.accessToken.exp * 1000);
    return new Date() > new Date(accessTokenExpiry.getTime() - appConfig.accessTokenRefreshBeforeInvalid);
  }

  getRefreshToken(): string {
    if (!this.tokens)
      throw new Error('No refresh token present');
    return this.tokens.refreshToken;
  }
}

export const TokenService = new _TokenService();
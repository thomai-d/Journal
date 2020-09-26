import axios from 'axios';
import { Tokens, TokenService } from './TokenService';
import { logger } from '../util/logger';
import { Document, ValuesResult, GroupByTime } from './model';

export async function login(username: string, password: string): Promise<Tokens> {
  const response = await axios.post<Tokens>('api/login', { user: username, password });
  if (response.status === 200) {
    return response.data;
  }
 
  throw new Error('Login failed');
}

export async function refreshToken(refreshToken: string): Promise<Tokens> {
  const response = await axios.post<Tokens>('api/login/refresh', { refreshToken });
  if (response.status === 200) {
    return response.data;
  }
 
  throw new Error('Token refresh failed');
}

let currentRefreshRequest: Promise<Tokens> | null = null;
function usingTokens<TParam extends any[], TResult>(func: (...args: TParam) => Promise<TResult>) {
  return async (...args: TParam): Promise<TResult> => {

    if (!TokenService.isLoggedIn) {
      throw new Error('Not logged in.');
    }

    if (currentRefreshRequest) {
      logger.debug('Token refresh pending. Waiting...');
      await currentRefreshRequest;
    }

    if (TokenService.accessTokenNeedsRefresh()) {
      logger.info('Refreshing access token...');
      currentRefreshRequest = refreshToken(TokenService.getRefreshToken());
      try {
        const tokens = await currentRefreshRequest;
        TokenService.setTokens(tokens);
      }
      finally {
        currentRefreshRequest = null;
      }
    }

    return func(...args);
  };
}

export const explore = usingTokens(async (group: GroupByTime, filter: string): Promise<ValuesResult[]> => {
  const response = await axios.post('api/explore', {
    aggregate: 'sum',
    GroupByTime: group,
    filter,
  });

  if (response.status === 200) {
    return response.data as ValuesResult[];
  }
 
  throw new Error('Explore query failed');
});

export const queryDocuments = usingTokens((async (filter: string): Promise<Document[]> => {
  const response = await axios.post<Document[]>('api/document/query', { filter });

  if (response.status === 200) {
    return response.data;
  }
 
  throw new Error('Query documents failed');
}));

export const getDocument = usingTokens(async (id: string): Promise<Document> => {
  const response = await axios.get<Document>(`api/document/${id}`);
  if (response.status === 200) {
    return response.data;
  }

  throw new Error(response.statusText);
});

export const addDocument = usingTokens(async (content: string, attachments: File[]): Promise<void> => {
  const formData = new FormData();
  formData.append("Content", content);
  attachments.forEach(file => formData.append("attachments", file));

  const response = await axios.post<Document[]>('api/document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.status === 201) {
    return;
  }
 
  throw new Error(`Add document failed with code ${response.status}`);
});
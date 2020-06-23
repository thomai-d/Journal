import axios from 'axios';

export interface LoginResult {
  accessToken: string;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const response = await axios.post<LoginResult>('api/login', { user: username, password });
  if (response.status === 200) {
    return response.data;
  }
 
  throw new Error('Login failed');
}
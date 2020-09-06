import axios from 'axios';
import { Tokens } from './TokenService';

export async function login(username: string, password: string): Promise<Tokens> {
  const response = await axios.post<Tokens>('api/login', { user: username, password });
  if (response.status === 200) {
    return response.data;
  }
 
  throw new Error('Login failed');
}
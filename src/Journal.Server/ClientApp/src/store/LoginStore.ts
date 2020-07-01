import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { login } from '../api/loginApi';
import jwt_decode from 'jwt-decode';
import axios from 'axios';

export interface LoginState {
  accessToken?: string;
  username?: string;
}

export interface LoginSuccess {
  type: 'LOGIN_SUCCESS',
  accessToken: string,
  username: string;
}

export interface LoginFailed {
  type: 'LOGIN_FAILED',
}

export interface Logout {
  type: 'LOGOUT',
}

interface AccessToken {
  preferred_username: string;
}

type KnownAction = LoginSuccess | LoginFailed | Logout;

export const actions = {
  login: (username: string, password: string): AppThunkAction<KnownAction, Promise<boolean>> => async (dispatch) => {
    try {
      const loginResult = await login(username, password);
      const token = jwt_decode(loginResult.accessToken) as AccessToken;

      axios.defaults.headers.common = { 'Authorization': `bearer ${loginResult.accessToken}` }

      dispatch ({
        type: 'LOGIN_SUCCESS',
        accessToken: loginResult.accessToken,
        username: token.preferred_username
      } as LoginSuccess);
      return true;
    }
    catch (err) {
      dispatch ({ type: 'LOGIN_FAILED' } as LoginFailed);
      return false;
    }
  },

  logout: (): AppThunkAction<KnownAction> => async (dispatch) => {
    dispatch({ type: 'LOGOUT' });
  }

}

export const reducer: Reducer<LoginState> = (state: LoginState | undefined, action: KnownAction) : LoginState => {
  if (!state) {
    return { };
  }

  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, accessToken: action.accessToken, username: action.username };
    case 'LOGIN_FAILED':
      return { ...state, accessToken: undefined, username: undefined };
    case 'LOGOUT':
      return { ...state, accessToken: undefined, username: undefined };
  }

  return state;
}
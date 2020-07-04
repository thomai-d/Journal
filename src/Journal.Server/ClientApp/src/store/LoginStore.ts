import { Reducer } from 'redux';
import { AppThunkAction, ApplicationState } from '.';
import { login } from '../api/loginApi';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import { RehydrateAction } from 'redux-persist';

export interface LoginState {
  accessToken?: string;
  username?: string;
  isLoggedIn: boolean;
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

export type KnownAction = LoginSuccess | LoginFailed | Logout | RehydrateAction;

export const actions = {
  login: (username: string, password: string): AppThunkAction<KnownAction, Promise<boolean>> => async (dispatch) => {
    try {
      const loginResult = await login(username, password);
      const token = jwt_decode(loginResult.accessToken) as AccessToken;

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
    return {
      isLoggedIn: false
    };
  }

  switch (action.type) {
    case 'persist/REHYDRATE':
      const lastState = action.payload as ApplicationState;
      axios.defaults.headers.common = { 'Authorization': `bearer ${lastState.login.accessToken}` }
      return state;

    case 'LOGIN_SUCCESS':
      axios.defaults.headers.common = { 'Authorization': `bearer ${action.accessToken}` }
      return {
        ...state,
        accessToken: action.accessToken,
        username: action.username,
        isLoggedIn: !!action.accessToken
      };
    case 'LOGIN_FAILED':
      return { ...state, accessToken: undefined, username: undefined, isLoggedIn: false };
    case 'LOGOUT':
      return { ...state, accessToken: undefined, username: undefined, isLoggedIn: false };
  }

  return state;
}
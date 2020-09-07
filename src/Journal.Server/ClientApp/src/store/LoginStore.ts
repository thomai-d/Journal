import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { RehydrateAction } from 'redux-persist';
import { login, TokenService, Tokens } from '../api';
import { ApplicationState } from './configureStore';

export interface LoginState {
  tokens?: Tokens;
  username?: string;
  isLoggedIn: boolean;
}

export interface LoginSuccess {
  type: 'LOGIN_SUCCESS',
  tokens?: Tokens,
  expiry: Date,
  username: string;
}

export interface LoginFailed {
  type: 'LOGIN_FAILED',
}

export interface Logout {
  type: 'LOGOUT',
}

export type KnownAction = LoginSuccess | LoginFailed | Logout | RehydrateAction;

export const actions = {
  login: (username: string, password: string): AppThunkAction<KnownAction, Promise<boolean>> => async (dispatch) => {
    try {
      const tokens = await login(username, password);
      TokenService.setTokens(tokens);

      dispatch ({
        type: 'LOGIN_SUCCESS',
        username: TokenService.getUsername(),
        tokens: tokens,
      } as LoginSuccess);
      return true;
    }
    catch (err) {
      TokenService.clearTokens();
      dispatch ({ type: 'LOGIN_FAILED' } as LoginFailed);
      return false;
    }
  },

  logout: (): AppThunkAction<KnownAction> => async (dispatch) => {
    TokenService.clearTokens();
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
      if (!lastState)
        return state;
      return lastState.login;

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        tokens: action.tokens,
        username: action.username,
        isLoggedIn: !!action.tokens,
      };

    case 'LOGIN_FAILED':
      return { ...state, tokens: undefined, username: undefined, isLoggedIn: false };

    case 'LOGOUT':
      return { ...state, tokens: undefined, username: undefined, isLoggedIn: false };
  }

  return state;
}
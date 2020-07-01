import * as LoginStore from './LoginStore';
import * as HistoryStore from './HistoryStore';

export interface ApplicationState {
    login: LoginStore.LoginState;
    history: HistoryStore.HistoryState;
}

export const reducers = {
    login: LoginStore.reducer,
    history: HistoryStore.reducer
};

export interface AppThunkAction<TAction, TReturn = void> {
    (dispatch: (action: TAction) => TReturn, getState: () => ApplicationState): TReturn;
}

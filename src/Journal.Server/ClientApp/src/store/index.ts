import * as LoginStore from './LoginStore';
import * as HistoryStore from './HistoryStore';
import * as SnackbarStore from './SnackbarStore';

export interface ApplicationState {
    login: LoginStore.LoginState;
    history: HistoryStore.HistoryState;
    snackbar: SnackbarStore.SnackbarState;
}

export const reducers = {
    login: LoginStore.reducer,
    history: HistoryStore.reducer,
    snackbar: SnackbarStore.reducer
};

export interface AppThunkAction<TAction, TReturn = void> {
    (dispatch: (action: TAction) => TReturn, getState: () => ApplicationState): TReturn;
}

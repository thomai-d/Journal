import * as LoginStore from './LoginStore';
import * as HistoryStore from './HistoryStore';
import * as SnackbarStore from './SnackbarStore';
import { ApplicationState } from './configureStore';

export const reducers = {
    login: LoginStore.reducer,
    history: HistoryStore.reducer,
    snackbar: SnackbarStore.reducer
};

export interface AppThunkAction<TAction, TReturn = void> {
    (dispatch: (action: TAction) => TReturn, getState: () => ApplicationState): TReturn;
}
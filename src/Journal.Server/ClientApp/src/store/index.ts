import { ApplicationState } from './configureStore';

export interface AppThunkAction<TAction, TReturn = void> {
    (dispatch: (action: TAction) => TReturn, getState: () => ApplicationState): TReturn;
}
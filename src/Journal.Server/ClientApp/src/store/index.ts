import * as WeatherForecasts from './WeatherForecasts';
import * as CounterStore from './CounterStore';
import * as LoginStore from './LoginStore';
import * as HistoryStore from './HistoryStore';

export interface ApplicationState {
    counter: CounterStore.CounterState;
    weatherForecasts: WeatherForecasts.WeatherForecastsState;
    login: LoginStore.LoginState;
    history: HistoryStore.HistoryState;
}

export const reducers = {
    counter: CounterStore.reducer,
    weatherForecasts: WeatherForecasts.reducer,
    login: LoginStore.reducer,
    history: HistoryStore.reducer
};

export interface AppThunkAction<TAction, TReturn = void> {
    (dispatch: (action: TAction) => TReturn, getState: () => ApplicationState): TReturn;
}

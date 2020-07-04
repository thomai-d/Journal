import { MiddlewareAPI, Dispatch, Middleware, Action } from 'redux';
import { appConfig } from '../../appConfig';
import { logger } from '../../util/logger';
import { ApplicationState } from '../configureStore';

export const actionLogger:Middleware = <S extends Dispatch<any>>
  (store: MiddlewareAPI<S, ApplicationState>) =>
  (next: Dispatch<Action<any>>) =>
  (action: Action<any>) => {

    if (appConfig.logReduxActions
    && appConfig.logIgnoreActionTypes.indexOf(action.type) < 0) {
      logger.debug(`Dispatched {type}`, action);
    }

    next(action);
}

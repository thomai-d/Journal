import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import history from './router/history';
import configureStore from './store/configureStore';
import App from './App';
import axios from 'axios';
import { TokenService } from './api';
import { logger } from './util/logger';

import './animations.css';
import { PersistGate } from 'redux-persist/integration/react';

// todo: env.environment?
const baseUrl = window.location.protocol + '//' + window.location.hostname + ':5000';
logger.info(`BaseURL is ${baseUrl}`);
axios.defaults.baseURL = baseUrl;

const { store, persistor } = configureStore(history);
persistor.subscribe(() => {
  const state = store.getState();

  if (state.login.tokens) {
    logger.debug('Applying persisted tokens...');
    TokenService.setTokens(state.login.tokens);
  }

  ReactDOM.render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </PersistGate>
    </Provider>,
    document.getElementById('root')
  );
});
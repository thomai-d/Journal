import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import history from './router/history';
import configureStore from './store/configureStore';
import App from './App';
import axios from 'axios';

import './animations.css';
import { PersistGate } from 'redux-persist/integration/react';

const { store, persistor } = configureStore(history);

// todo: env.environment?
axios.defaults.baseURL = 'http://localhost:5000';

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

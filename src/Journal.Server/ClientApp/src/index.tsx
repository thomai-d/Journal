import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import history from './router/history';
import configureStore from './store/configureStore';
import App from './App';
import axios from 'axios';

import './animations.css';

const store = configureStore(history);

// todo: env.environment?
axios.defaults.baseURL = 'http://localhost:5000';

ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </Provider>,
  document.getElementById('root')
);

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import configureStore from './store/configureStore';
import App from './App';
import axios from 'axios';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href') as string;
const history = createBrowserHistory({ basename: baseUrl });

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

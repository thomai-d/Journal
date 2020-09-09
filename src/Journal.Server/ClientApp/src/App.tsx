import * as React from 'react';
import { Route, Redirect, Switch } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Pages/Home';
import NewEntry from './components/Pages/NewEntry';
import History from './components/Pages/History';
import { CssBaseline } from '@material-ui/core';
import { ProtectedRoute } from './router/ProtectedRoute';
import HotkeyListener from './components/controls/HotkeyListener';
import history from './router/history';

export default () => {
  return (
    <Layout>
      <CssBaseline />
      <HotkeyListener hotkeys={{
        "CTRL+SHIFT+N": () => { history.push('/new')},
        "CTRL+SHIFT+K": () => { history.push('/history')},
      }}>
        <Switch>
          <Route exact path="/" component={Home} />
          <ProtectedRoute path="/new" component={NewEntry} />
          <ProtectedRoute path="/history" component={History} />
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </HotkeyListener>
    </Layout>
  );
};

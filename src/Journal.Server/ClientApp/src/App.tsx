import * as React from 'react';
import { Route, Redirect, Switch } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Pages/Home';
import NewEntry from './components/Pages/NewEntry';
import History from './components/Pages/History';
import { CssBaseline } from '@material-ui/core';
import { ProtectedRoute } from './router/ProtectedRoute';

export default () => {
  return (
    <Layout>
      <CssBaseline />
      <Switch>
        <Route exact path="/" component={Home} />
        <ProtectedRoute path="/new" component={NewEntry} />
        <ProtectedRoute path="/history" component={History} />
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Layout>
  );
};

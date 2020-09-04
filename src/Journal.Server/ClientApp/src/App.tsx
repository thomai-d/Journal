import * as React from 'react';
import { Route, Redirect, Switch } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Pages/Home';
import NewEntry from './components/Pages/NewEntry';
import History from './components/Pages/History';
import { CssBaseline } from '@material-ui/core';
import { ProtectedRoute } from './router/ProtectedRoute';
import history from './router/history';

export default () => {

  React.useEffect(() => {

    const onHotkey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        history.push('/new');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        history.push('/history');
      }
    };

    document.addEventListener('keydown', onHotkey);
    return () => document.removeEventListener('keydown', onHotkey);
  });

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

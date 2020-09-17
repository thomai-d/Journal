import * as React from 'react';
import { Route, Redirect, Switch } from 'react-router';
import Layout from './components/Layout';
import { CssBaseline } from '@material-ui/core';
import { ProtectedRoute } from './router/ProtectedRoute';
import HotkeyListener from './components/controls/HotkeyListener';
import history from './router/history';
import { pageTree } from './navigation';

export default () => {

  const hotkeys = pageTree
                    .filter(i => !!i.hotkey)
                    .reduce((o, i) => ({ ...o, [i.hotkey!]: () => history.push(i.path) }), {});

  return (
    <Layout>
      <CssBaseline />
      <HotkeyListener hotkeys={hotkeys}>
        <Switch>
          { pageTree.map(i => i.protected
              ? <ProtectedRoute key={i.path} exact path={i.path} component={i.component} />
              : <Route key={i.path} exact path={i.path} component={i.component} />
          )}
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </HotkeyListener>
    </Layout>
  );
};

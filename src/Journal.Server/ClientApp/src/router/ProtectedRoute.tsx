import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, RouteProps } from 'react-router';
import { ApplicationState } from '../store/configureStore';

const stateToProps = (state: ApplicationState) => ({
  isLoggedIn: state.login.isLoggedIn
});

type Props = ReturnType<typeof stateToProps>;

const _ProtectedRoute = (props: Props & RouteProps) => {
  if (props.isLoggedIn) {
    return <Route {...props} />;
  }

  const newProps = {...props, component: undefined}
  return <Route {...newProps}>
    <Redirect to="/" />
  </Route>;
};


export const ProtectedRoute = connect(stateToProps)(_ProtectedRoute);
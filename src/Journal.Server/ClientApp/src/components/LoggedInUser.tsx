import * as React from 'react';
import { ApplicationState } from '../store';
import { connect } from 'react-redux';
import * as Login from '../store/Login';
import { Button } from '@material-ui/core';
import { AnyAction, bindActionCreators, Dispatch } from 'redux';

type Props = {
  isLoggedIn: boolean,
  username?: string
};

const dispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators({
    login: Login.actions.login,
    logout: Login.actions.logout
  }, dispatch);

type DispatchProps = ReturnType<typeof dispatchToProps>;

class LoggedInUser extends React.Component<Props & DispatchProps> {

  onLogin = async (e: any) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const username = data.get('username') as string;
    const password = data.get('password') as string;
    await this.props.login(username, password);
  }

  onLogout = () => {
    this.props.logout();
  }

  onUsernameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ username: event.target.value })
  }
  
  onPasswordChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ password: event.target.value })
  }

  render = () => {
    return (
      <>
        LoggedIn: {this.props.isLoggedIn ? 'yes' : 'no'}
        {!this.props.isLoggedIn && (
          <form onSubmit={this.onLogin}>
            <input
              type="text"
              name="username"
              onChange={this.onUsernameChanged}
            ></input>
            <input
              type="password"
              name="password"
              onChange={this.onPasswordChanged}
            ></input>
            <Button type="submit">Login</Button>
          </form>
        )}
        {this.props.isLoggedIn && (
          <>
            <dl>
              <dt>Username</dt>
              <dd>{this.props.username}</dd>
            </dl>
            <Button type="button" onClick={this.onLogout}>
              Logout
            </Button>
          </>
        )}
      </>
    );
  }
}

const stateToProps = (state: ApplicationState): Props => {
  return {
    isLoggedIn: Login.selectors.isLoggedIn(state),
    username: state.login ? state.login.username : undefined
  } as Props;
};

export default connect(stateToProps, dispatchToProps)(LoggedInUser);
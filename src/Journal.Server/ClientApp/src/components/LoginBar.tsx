import * as React from 'react';
import { ApplicationState } from '../store';
import { connect } from 'react-redux';
import * as LoginStore from '../store/Login';
import { IconButton, TextField, Menu, MenuItem } from '@material-ui/core';
import { Grid, Icon } from '@material-ui/core';
import { AnyAction, bindActionCreators, Dispatch } from 'redux';
import { AccountCircle, ExitToApp, ArrowDropDown } from '@material-ui/icons';

type Props = {
  isLoggedIn: boolean;
  username?: string;
};

type State = {
  userMenuTarget: any;
};

const stateToProps = (state: ApplicationState): Props => {
  return {
    isLoggedIn: state.login ? !!state.login.accessToken : false,
    username: state.login ? state.login.username : undefined,
  } as Props;
};

const dispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      login: LoginStore.actions.login,
      logout: LoginStore.actions.logout,
    },
    dispatch
  );

type DispatchProps = ReturnType<typeof dispatchToProps>;

class LoginBar extends React.Component<Props & DispatchProps, State> {

  constructor(props: any) {
    super(props);

    this.state = {
      userMenuTarget: null
    };
  }

  render = () => {
    const styles = {
      textBox: {
        background: 'white',
        marginLeft: '8px',
      } as React.CSSProperties,

      form: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      } as React.CSSProperties
    };

    return (
      <>
        {!this.props.isLoggedIn && (
          <Grid container justify="flex-end" alignItems="center">
            <form onSubmit={this.onLogin} style={styles.form}>
              <TextField
                name="username"
                color="primary"
                placeholder="Username"
                style={styles.textBox}
              ></TextField>
              <TextField
                name="password"
                color="primary"
                type="password"
                placeholder="Password"
                style={styles.textBox}
              ></TextField>
              <IconButton type="submit" color="inherit">
                <ExitToApp />
              </IconButton>
            </form>
          </Grid>
        )}
        {this.props.isLoggedIn && (
          <Grid container justify="flex-end" alignItems="center">
            <Grid item>
              <Icon
                onClick={this.onUserClick}
                component={AccountCircle}
                fontSize="large"
                style={{ verticalAlign: 'middle', cursor: 'pointer' }}
              />
              <Icon
                onClick={this.onUserClick}
                component={ArrowDropDown}
                fontSize="large"
                style={{ verticalAlign: 'middle', cursor: 'pointer' }}
              />
            </Grid>
          </Grid>
        )}

        <Menu
          open={this.state.userMenuTarget !== null}
          anchorEl={this.state.userMenuTarget}
          onClose={this.onUserMenuClose}
        >
          <MenuItem disabled>Signed in as '{this.props.username}'</MenuItem>
          <MenuItem onClick={this.onLogout}>Logout</MenuItem>
        </Menu>
      </>
    );
  };

  onUserClick = (e: React.MouseEvent) => {
    this.setState({ userMenuTarget: e.currentTarget });
  };

  onUserMenuClose = () => {
    this.setState({ userMenuTarget: null });
  };

  onLogin = async (e: any) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const username = data.get('username') as string;
    const password = data.get('password') as string;
    await this.props.login(username, password);
  };

  onLogout = () => {
    this.setState({ userMenuTarget: null });
    this.props.logout();
  };
}

export default connect(stateToProps, dispatchToProps)(LoginBar);

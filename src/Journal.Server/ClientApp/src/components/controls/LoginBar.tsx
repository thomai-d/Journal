import * as React from 'react';
import { ApplicationState } from '../../store';
import { connect } from 'react-redux';
import * as LoginStore from '../../store/LoginStore';
import { IconButton, TextField, Menu, MenuItem, Theme, makeStyles } from '@material-ui/core';
import { Grid, Icon } from '@material-ui/core';
import { AnyAction, bindActionCreators, Dispatch } from 'redux';
import { AccountCircle, ExitToApp, ArrowDropDown } from '@material-ui/icons';
import { useState } from 'react';

const useStyle = makeStyles((theme: Theme) => ({
    textBox: {
      background: 'white',
      marginLeft: '8px',
    },
    
    form: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },

    iconButton: {
      verticalAlign: 'middle',
      cursor: 'pointer'
    }
}));

const stateToProps = (state: ApplicationState) => {
  return {
    isLoggedIn: state.login ? !!state.login.accessToken : false,
    username: state.login ? state.login.username : undefined,
  };
};

const dispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      login: LoginStore.actions.login,
      logout: LoginStore.actions.logout,
    },
    dispatch
  );

type Props = ReturnType<typeof stateToProps> &
  ReturnType<typeof dispatchToProps>;

const LoginBar = (props: Props) => {

  const [userMenuTarget, setUserMenuTarget] = useState<any>(null);
  const classes = useStyle();

  const onUserClick = (e: React.MouseEvent) => {
    setUserMenuTarget(e.currentTarget);
  };

  const onUserMenuClose = () => {
    setUserMenuTarget(null);
  };

  const onLogin = async (e: any) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const username = data.get('username') as string;
    const password = data.get('password') as string;
    await props.login(username, password);
  };

  const onLogout = () => {
    setUserMenuTarget(null);
    props.logout();
  };

  return (
    <>
      {!props.isLoggedIn && (
        <Grid container justify="flex-end" alignItems="center">
          <form onSubmit={onLogin} className={classes.form}>
            <TextField
              name="username"
              color="primary"
              placeholder="Username"
              className={classes.textBox}
            ></TextField>
            <TextField
              name="password"
              color="primary"
              type="password"
              placeholder="Password"
              className={classes.textBox}
            ></TextField>
            <IconButton type="submit" color="inherit">
              <ExitToApp />
            </IconButton>
          </form>
        </Grid>
      )}

      {props.isLoggedIn && (
        <Grid container justify="flex-end" alignItems="center">
          <Grid item>
            <Icon
              onClick={onUserClick}
              component={AccountCircle}
              fontSize="large"
              className={classes.iconButton}
            />
            <Icon
              onClick={onUserClick}
              component={ArrowDropDown}
              fontSize="large"
              className={classes.iconButton}
            />
          </Grid>
        </Grid>
      )}

      <Menu
        open={userMenuTarget !== null}
        anchorEl={userMenuTarget}
        onClose={onUserMenuClose}
      >
        <MenuItem disabled>Logged in as '{props.username}'</MenuItem>
        <MenuItem onClick={onLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export default connect(stateToProps, dispatchToProps)(LoginBar);

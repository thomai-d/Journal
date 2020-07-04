import * as React from 'react';
import { connect } from 'react-redux';
import * as LoginStore from '../../store/LoginStore';
import { IconButton, TextField, Menu, MenuItem, Theme, makeStyles } from '@material-ui/core';
import { Icon } from '@material-ui/core';
import { AnyAction, bindActionCreators, Dispatch } from 'redux';
import { AccountCircle, ExitToApp, ArrowDropDown } from '@material-ui/icons';
import { useState, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { ApplicationState } from '../../store/configureStore';

const useStyle = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
    height: '50px'
  },

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
    cursor: 'pointer',
    flex: '0 0 auto',
  },

  loginBox: {
    position: 'absolute'
  },

  userMenu: {
    position: 'absolute',
    display: 'flex'
  }
}));

const stateToProps = (state: ApplicationState) => {
  return {
    isLoggedIn: state.login.isLoggedIn,
    username: state.login.username
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
  const [loginInProgress, setLoginInProgress] = useState(false);
  const loginBoxRef = useRef<HTMLDivElement>(null);
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

    setLoginInProgress(true);
    const success = await props.login(username, password);

    const loginBox = loginBoxRef.current;
    if (!success && loginBox) {
        loginBox.classList.remove('shake');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const bla = loginBox.offsetWidth;
        // eslint-enable-next-line @typescript-eslint/no-unused-vars
        loginBox.classList.add('shake');
    }
    
    setLoginInProgress(false);
  };

  const onLogout = () => {
    setUserMenuTarget(null);
    props.logout();
  };

  return (
    <>
      <div className={classes.root}>
        <CSSTransition
          in={!props.isLoggedIn}
          timeout={300}
          classNames="slide-in-right"
          unmountOnExit
        >
          <div id="loginBox" ref={loginBoxRef} className={classes.loginBox}>
            <form onSubmit={onLogin} className={classes.form}>
              <TextField disabled={loginInProgress}
                name="username"
                color="primary"
                placeholder="Username"
                className={classes.textBox}
              ></TextField>
              <TextField disabled={loginInProgress}
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
          </div>
        </CSSTransition>

        <CSSTransition
          in={props.isLoggedIn}
          timeout={300}
          classNames="fade-in"
          unmountOnExit
        >
          <div id="userMenu" className={classes.userMenu}>
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
          </div>
        </CSSTransition>
      </div>

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

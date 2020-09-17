import * as React from 'react';
import { AppBar, Typography, Grid, IconButton, Paper, Theme, makeStyles } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import LoginBar from './controls/LoginBar';
import SnackbarComponent from './controls/Snackbar';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import { ApplicationState } from '../store/configureStore';
import Navigation from './controls/Navigation';

const useStyle = makeStyles((theme: Theme) => ({
  content: {
    padding: theme.spacing(1),
    flexGrow: 1,
  },

  title: {
    marginLeft: theme.spacing(0.5)
  }
}));

const stateToProps = (state: ApplicationState) => ({
  isLoggedIn: state.login.isLoggedIn
});

type Props = ReturnType<typeof stateToProps> & {
  children?: React.ReactNode
};

export const Layout = (props: Props) => {

  const classes = useStyle();

  return (
    <React.Fragment>
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
      <AppBar position="static" style={{flexGrow: 0}}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Grid container justify="flex-start" alignItems="center">
              <CSSTransition
                in={props.isLoggedIn}
                timeout={300}
                classNames="slide-in-icon-left"
                unmountOnExit>
                <Grid item>
                  <IconButton color="inherit" className="grow">
                    <Menu />
                  </IconButton>
                </Grid>
              </CSSTransition>
              <Grid item>
                <Typography variant="h4" className={classes.title}>
                  Journal
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs>
            <LoginBar />
          </Grid>
        </Grid>
      </AppBar>

      <main style={{flexGrow: 1, display: 'flex', alignItems: 'stretch', flexDirection: 'column'}}>
        <Paper className={classes.content}>{props.children}</Paper>
      </main>

      {props.isLoggedIn && (
        <Navigation />
      )}

      <SnackbarComponent />
      </div>
    </React.Fragment>
  );
};

export default connect(stateToProps)(Layout);
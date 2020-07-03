import * as React from 'react';
import { AppBar, Typography, Grid, IconButton, Drawer, List, ListItem, Paper, Theme, makeStyles } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import LoginBar from './controls/LoginBar';
import { useHistory } from 'react-router';
import SnackbarComponent from './controls/Snackbar';
import { ApplicationState } from '../store';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';

const useStyle = makeStyles((theme: Theme) => ({
  content: {
    padding: theme.spacing(1)
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

  const [isOpen, setIsOpen] = React.useState(false);
  const history = useHistory();

  const onMenuToggle = () => {
      setIsOpen(!isOpen);
  }

  const onMenuClose = () => {
      setIsOpen(false);
  }

  const goto = (url: string) => {
      history.push(url);
      setIsOpen(false);
  }

  return (
    <React.Fragment>
      <header>
        <AppBar position="static">
          <Grid container alignItems="center">
            <Grid item xs>
              <Grid container justify="flex-start" alignItems="center">
                <CSSTransition
                  in={props.isLoggedIn}
                  timeout={300}
                  classNames="slide-in-icon-left"
                  unmountOnExit>
                  <Grid item>
                    <IconButton color="inherit" onClick={onMenuToggle} className="grow">
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

        {props.isLoggedIn && (
          <Drawer open={isOpen} onClose={onMenuClose}>
            <nav>
              <List>
                <ListItem
                  button
                  onClick={() => {
                    goto('/new');
                  }}
                >
                  New
                </ListItem>
                <ListItem
                  button
                  onClick={() => {
                    goto('/history');
                  }}
                >
                  History
                </ListItem>
              </List>
            </nav>
          </Drawer>
        )}
      </header>
      <main>
        <Paper className={classes.content}>{props.children}</Paper>
      </main>

      <SnackbarComponent />
    </React.Fragment>
  );
};

export default connect(stateToProps)(Layout);
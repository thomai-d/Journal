import * as React from 'react';
import { AppBar, Typography, Grid, IconButton, Drawer, List, ListItem, Paper } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import LoginBar from './LoginBar';
import { useHistory } from 'react-router';

export default (props: { children?: React.ReactNode }) => {

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
            <Grid container alignItems="center" style={{ height: '4em' }}>
              <Grid item xs>
                <Grid container justify="flex-start">
                  <Grid item>
                    <IconButton color="inherit" onClick={onMenuToggle}>
                      <Menu />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <Typography variant="h4" style={{ marginLeft: '8px' }}>
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
              </List>
            </nav>
          </Drawer>
        </header>
        <main>
          <Paper>{props.children}</Paper>
        </main>
      </React.Fragment>
    );
};

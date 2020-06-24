import * as React from 'react';
import { AppBar, Typography, Grid } from '@material-ui/core';
import LoginBar from './LoginBar';

export default class NavMenu extends React.PureComponent<
  {},
  { isOpen: boolean }
> {
  public state = {
    isOpen: false,
  };

  public render() {
    return (
      <header>
        <AppBar position="static">
          <Grid container alignItems="center" style={{height: '4em'}}>
            <Grid item xs>
              <Typography variant="h4" style={{marginLeft: '8px'}}>
                Journal
              </Typography>
            </Grid>

            <Grid item xs>
              <LoginBar />
            </Grid>
          </Grid>
        </AppBar>
      </header>
    );
  }

  private toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };
}

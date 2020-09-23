import * as React from 'react';
import { Theme, makeStyles } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

const useStyle = makeStyles((theme: Theme) => ({
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignSelf: 'stretch',
    flex: '1 0 auto',
  },

  alert: {
    maxWidth: '50%',
    alignSelf: 'center',
  }
}));

type Props = {
  message: string;
};

export default (props: Props) => {

  const classes = useStyle();

  return (
    <div className={classes.errorContainer}>
      <MuiAlert className={classes.alert} severity="warning" variant="filled" >
        <span>{props.message}</span>
      </MuiAlert>
    </div>)
}
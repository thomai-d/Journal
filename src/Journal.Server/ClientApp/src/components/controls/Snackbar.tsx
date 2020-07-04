import * as React from 'react';
import { connect } from 'react-redux';
import { Snackbar } from '@material-ui/core';
import { Dispatch, AnyAction, bindActionCreators } from 'redux';
import * as SnackbarStore from '../../store/SnackbarStore';
import MuiAlert from '@material-ui/lab/Alert';
import { ApplicationState } from '../../store/configureStore';

const stateToProps = (state: ApplicationState) => {
  return {
    snackbar: state.snackbar
  };
}

const dispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators({
    closeSnackbar: SnackbarStore.actions.closeSnackbar
  }, dispatch);

type Props = ReturnType<typeof stateToProps>
           & ReturnType<typeof dispatchToProps>;

const SnackbarComponent = (props: Props) => {

  const onClose = () => {
    props.closeSnackbar();
  }

  return (
    <Snackbar open={props.snackbar.isOpen} onClose={onClose}>
        <MuiAlert severity={props.snackbar.type} variant="filled">
          {props.snackbar.text}
     </MuiAlert>
    </Snackbar>
  );
}

export default connect(stateToProps, dispatchToProps)(SnackbarComponent);
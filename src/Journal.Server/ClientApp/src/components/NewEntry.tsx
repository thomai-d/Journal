import * as React from 'react';
import { ApplicationState } from '../store';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';

type Props = {};

class NewEntry extends React.Component<Props> {

  render() {
    return (
      <>
      <textarea></textarea>
      <Button>Save</Button>
      </>
    );
  }

}

export default connect(
  (state: ApplicationState) => state
)(NewEntry);
import * as React from 'react';
import { ApplicationState } from '../../store';
import { connect } from 'react-redux';
import { TextField, IconButton, createStyles, Paper, WithStyles, Theme, withStyles } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import TagList from '../controls/TagList';

const styles = (theme: Theme) => createStyles({
});

interface Props extends WithStyles<typeof styles>{
}

interface State {
  tags: string[];
};

class NewEntry extends React.Component<Props, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      tags: []
    }
  }

  render() {

    return (
      <>
        <form noValidate autoComplete="off" style={{ margin: '8px', display: 'flex', alignItems: 'flex-start' }}
              onSubmit={this.onSubmit}>
              <TextField multiline name="text" rows="10" variant="outlined" fullWidth
                        style={{ flex: 1 }} onChange={this.onTextChange}></TextField>

              <IconButton type="submit">
                <Save color="primary" fontSize="large" />
              </IconButton>
        </form>

        <Paper>
          <TagList tags={this.state.tags} />
        </Paper>
      </>
    );
  }

  onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }

  onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const allTags = text.match(/#[A-Za-z_\-À-ž]+/g);
    if (!allTags) {
      this.setState({ tags: [] });
      return;
    }

    const tags = [...new Set(allTags.map(t => t.substr(1)))];
    this.setState({ tags });
  }
}

export default connect(
  (state: ApplicationState) => state
)(withStyles(styles)(NewEntry));
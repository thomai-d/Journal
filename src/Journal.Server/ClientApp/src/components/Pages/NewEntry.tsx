import * as React from 'react';
import { ApplicationState } from '../../store';
import { connect } from 'react-redux';
import { TextField, IconButton, createStyles, Paper, WithStyles, Theme, withStyles, Snackbar } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import TagList from '../controls/TagList';
import { addDocument } from '../../api/documentApi';

const styles = (theme: Theme) => createStyles({
  form: {
    margin: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'flex-start'
  },

  inputArea: {
    flex: 1
  }
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

    const { classes } = this.props;

    return (
      <>
        <form noValidate autoComplete="off" className={classes.form}
              onSubmit={this.onSubmit}>
              <TextField multiline name="content" rows="10" variant="outlined" fullWidth
                        className={classes.inputArea} onChange={this.onTextChange}></TextField>

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

  onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get('content') as string;

    try {
      const form = e.currentTarget;
      await addDocument(content);
      form.reset();
    }
    catch (err) {
      console.error(err);
    }
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
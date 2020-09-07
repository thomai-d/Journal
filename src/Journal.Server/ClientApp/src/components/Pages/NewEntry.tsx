import * as React from 'react';
import { connect } from 'react-redux';
import { TextField, IconButton, createStyles, Paper, WithStyles, Theme, withStyles } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import TagList from '../controls/TagList';
import { addDocument } from '../../api';
import { Dispatch, AnyAction, bindActionCreators } from 'redux';
import * as SnackbarStore from '../../store/SnackbarStore';
import { logger } from '../../util/logger';
import { ApplicationState } from '../../store/configureStore';
import { DocumentParser } from '../../util/DocumentParser';

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

const dispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators({
    showSnackbar: SnackbarStore.actions.showSnackbar
  }, dispatch);

type Props = WithStyles<typeof styles> & ReturnType<typeof dispatchToProps> & {
}

interface State {
  tags: string[];
  values: string[];
};

class NewEntry extends React.Component<Props, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      tags: [],
      values: []
    }
  }

  render() {

    const { classes } = this.props;

    return (
      <>
        <form noValidate autoComplete="off" className={classes.form}
              onSubmit={this.onSubmit}>
              <TextField multiline autoFocus name="content" rows="10" variant="outlined" fullWidth
                        className={classes.inputArea} onChange={this.onTextChange}>
              </TextField>

              <IconButton type="submit">
                <Save color="primary" fontSize="large" />
              </IconButton>
        </form>

        <Paper>
          <TagList tags={this.state.tags} /><br />
          <TagList tags={this.state.values} />
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
      this.props.showSnackbar('Document saved.', 'info');
    }
    catch (err) {
      logger.err('create document', err);
      this.props.showSnackbar('Error while saving document', 'error');
    }
  }

  onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;

    const values = DocumentParser.parseObjectValues(text) ?? {};
    const tags = DocumentParser.parseTags(text);

    this.setState({ tags, values: Object.keys(values) });
  }
}

export default connect(
  (state: ApplicationState) => state,
  dispatchToProps
)(withStyles(styles)(NewEntry));
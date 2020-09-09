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
import HotkeyListener from '../controls/HotkeyListener';
import history from '../../router/history';

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

  private formRef = React.createRef<HTMLFormElement>();

  render() {

    const { classes } = this.props;

    return (
      <>
        <HotkeyListener hotkeys={{
          "CTRL+ENTER": async () => { await this.onSubmitForm(); history.push('/history')},
          "SHIFT+ENTER": async () => { await this.onSubmitForm(); },
        }}>
          <form ref={this.formRef} noValidate autoComplete="off" className={classes.form} onSubmit={this.onSubmit}>
                <TextField multiline autoFocus name="content" rows="10" variant="outlined" fullWidth
                          className={classes.inputArea} onChange={this.onTextChange}>
                </TextField>

                <IconButton type="submit">
                  <Save color="primary" fontSize="large" />
                </IconButton>
          </form>
        </HotkeyListener>

        <Paper>
          <TagList tags={this.state.tags} /><br />
          <TagList tags={this.state.values} />
        </Paper>
      </>
    );
  }

  onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await this.onSubmitForm();
  }

  onSubmitForm = async () => {
    const form = this.formRef.current!;
    const formData = new FormData(form);
    const content = formData.get('content') as string;

    try {
      await addDocument(content);
      this.props.showSnackbar('Document saved.', 'info');
      form.reset();
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
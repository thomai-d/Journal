import * as React from 'react';
import { connect } from 'react-redux';
import { TextField, createStyles, WithStyles, Theme, withStyles, Fab, Zoom } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import { addDocument } from '../../api';
import { Dispatch, AnyAction, bindActionCreators } from 'redux';
import * as SnackbarStore from '../../store/SnackbarStore';
import { logger } from '../../util/logger';
import { ApplicationState } from '../../store/configureStore';
import HotkeyListener from '../controls/HotkeyListener';
import history from '../../router/history';
import ImageUploadList, { UploadedImage } from '../controls/ImageUploadList';

const styles = (theme: Theme) => createStyles({
  form: {
    margin: theme.spacing(0.5),
    flex: '1 0 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  fab: {
    left: 'calc(50% - 28px)',
  },

  text: {
    marginBottom: theme.spacing(1),
    overflow: 'auto',
    flex: '1 0 0',
  },

  images: {
    flex: '0 0 auto',
  }
});

const dispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators({
    showSnackbar: SnackbarStore.actions.showSnackbar
  }, dispatch);

type Props = WithStyles<typeof styles> & ReturnType<typeof dispatchToProps> & {
}

interface State {
  isSubmitting: boolean;
  images: UploadedImage[];
};

class NewEntry extends React.Component<Props, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      isSubmitting: false,
      images: [],
    }
  }

  private formRef = React.createRef<HTMLFormElement>();

  componentWillUnmount() {
    this.cleanupImages();
  }

  render() {
    const { classes } = this.props;

    return (
      <>
        <HotkeyListener hotkeys={{
          "CTRL+ENTER": () => this.onSubmitForm(true),
          "SHIFT+ENTER": () => this.onSubmitForm(),
        }}>
          <form ref={this.formRef} noValidate autoComplete="off" className={classes.form} onSubmit={this.onSubmit}>
            <TextField className={classes.text} multiline autoFocus name="content" variant="outlined" fullWidth />

            <ImageUploadList className={classes.images} images={this.state.images} onImageAdded={this.onImageAdded} />

          </form>
        </HotkeyListener>

        <Zoom in>
          <Fab className={classes.fab} color="primary" onClick={() => this.onSubmitForm()}
               disabled={this.state.isSubmitting}>
            <Save />
          </Fab>
        </Zoom>
      </>
    );
  }

  private cleanupImages() {
    this.state.images.forEach(img => img.dispose());
  }
  
  private onImageAdded = (img: UploadedImage) => {
    this.setState({ images: [...this.state.images, img] });
  }

  private onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await this.onSubmitForm();
  }

  private onSubmitForm = async (stayOnPage = false) => {
    const form = this.formRef.current!;
    const formData = new FormData(form);
    const content = formData.get('content') as string;

    try {
      this.setState({isSubmitting: true});
      await addDocument(content, this.state.images.map(f => f.file));
      this.props.showSnackbar('Document saved.', 'info');
      this.cleanupImages();
      form.reset();

      if (!stayOnPage)
        history.push('/documents');
    }
    catch (err) {
      logger.err('create document', err);
      this.props.showSnackbar('Error while saving document', 'error');
      this.setState({isSubmitting: false});
    }
  }
}

export default connect(
  (state: ApplicationState) => state,
  dispatchToProps
)(withStyles(styles)(NewEntry));
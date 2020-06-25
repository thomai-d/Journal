import * as React from 'react';
import { ApplicationState } from '../store';
import { connect } from 'react-redux';
import { TextField, IconButton, createStyles, Paper, Chip, WithStyles, Theme, withStyles } from '@material-ui/core';
import { Save } from '@material-ui/icons';

const styles = (theme: Theme) => createStyles({
  chiplist: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    justifyContent: 'flex-start',
    padding: theme.spacing(0.5)
  },
  
  chip: {
    margin: theme.spacing(0.5)
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

        <Paper component="ul" className={this.props.classes.chiplist}>
          {this.state.tags.map(tag => (
            <li key={tag}>
              <Chip label={tag} className={this.props.classes.chip}
                    onClick={() => this.onTagSelected(tag)} />
            </li>
          ))}
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

  onTagSelected = (tag: string) => {
    console.log(tag);
  }

}

export default connect(
  (state: ApplicationState) => state
)(withStyles(styles)(NewEntry));
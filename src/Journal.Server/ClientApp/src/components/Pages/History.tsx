import * as React from 'react';
import { connect } from 'react-redux';
import { FormControl, InputAdornment, TextField, CircularProgress, TableContainer, Table, Paper, TableBody, TableRow, TableCell, Theme, makeStyles } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { debounce } from '../../util/debounce';
import { AnyAction, Dispatch, bindActionCreators } from 'redux';
import * as HistoryStore from '../../store/HistoryStore';
import { ApplicationState } from '../../store';
import TagList from '../controls/TagList';

const useStyle = makeStyles((theme: Theme) => ({
}));

const stateToProps = (state: ApplicationState) => {
  return {
    ...state.history
  }
}

const dispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators({
    search: HistoryStore.actions.search
  }, dispatch);

type Props = ReturnType<typeof stateToProps>;
type DispatchProps = ReturnType<typeof dispatchToProps>;

const History = (props: Props & DispatchProps) => {

  const classes = useStyle();

  const onSearchTextChange = React.useCallback(debounce(text => {
    props.search(text);
  }, 300), []);

  return (
    <>
      <FormControl>
        <TextField
          defaultValue={props.searchText}
          onChange={(e) => onSearchTextChange(e.currentTarget.value)}
          label="Filter"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" style={{ width: '28px' }}>
                {props.isSearching
                  ? <CircularProgress size="1em" />
                  : <Search />
                }
              </InputAdornment>
            ),
          }}
        />
      </FormControl>

      <TableContainer component={Paper} style={{marginTop: '16px'}}>
        <Table>
          <TableBody>
            {props.searchResults.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.content}</TableCell>
                <TableCell padding="none"><TagList tags={item.tags} /></TableCell>
                <TableCell>{item.created.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
      </TableContainer>
    </>
  );
}

export default connect(stateToProps, dispatchToProps)(History);
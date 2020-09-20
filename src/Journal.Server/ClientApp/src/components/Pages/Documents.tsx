import * as React from 'react';
import { connect } from 'react-redux';
import { Theme, makeStyles, Card, CardContent, Fab } from '@material-ui/core';
import { AnyAction, Dispatch, bindActionCreators } from 'redux';
import { ApplicationState } from '../../store/configureStore';
import DocumentList from '../controls/DocumentList';
import * as DocumentStore from '../../store/DocumentStore';
import Search from '../controls/Search';
import { useState } from 'react';
import AddIcon from '@material-ui/icons/Add';

const useStyle = makeStyles((theme: Theme) => ({
  search: {
    position: 'static',
    top: theme.spacing(1),
    left: theme.spacing(1),
  },
  growingCard: {
    overflow: 'auto',
    marginTop: theme.spacing(1),
    flex: '1 0 0',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(8),
    right: 'calc(50% - 28px)',
  },
}));

const stateToProps = (state: ApplicationState) => {
  return {
    documentSearchResults: state.documents.searchResults,
    searchError: state.documents.searchError,
    searchInProgress: state.documents.searchInProgress,
    searchText: state.documents.searchText,
  }
}

const dispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators({
    searchDocuments: DocumentStore.actions.searchDocuments,
  }, dispatch);

type Props = ReturnType<typeof stateToProps>;
type DispatchProps = ReturnType<typeof dispatchToProps>;

const Documents = (props: Props & DispatchProps) => {

  const classes = useStyle();
  const { searchInProgress } = props;
  const [ firstSearchText ] = useState(props.searchText);
  const onSearchTextChange = (text: string) => props.searchDocuments(text);

  return (<>
    <Search className={classes.search} onChange={onSearchTextChange} isSearching={searchInProgress} initialText={firstSearchText} />
    <DocumentList documents={props.documentSearchResults} error={props.searchError}></DocumentList>
    <Fab className={classes.fab} color="primary">
      <AddIcon />
    </Fab>
  </>);
}

export default connect(stateToProps, dispatchToProps)(Documents);
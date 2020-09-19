import * as React from 'react';
import { connect } from 'react-redux';
import { Theme, makeStyles, Card, CardContent } from '@material-ui/core';
import { AnyAction, Dispatch, bindActionCreators } from 'redux';
import { ApplicationState } from '../../store/configureStore';
import DocumentList from '../controls/DocumentList';
import * as DocumentStore from '../../store/DocumentStore';
import Search from '../controls/Search';
import { useState } from 'react';

const useStyle = makeStyles((theme: Theme) => ({
  growingCard: {
    marginTop: theme.spacing(1),
    flex: '1 0'
  },
  card: {
    marginTop: theme.spacing(1),
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
    <Card className={classes.card}>
      <CardContent>
        <Search onChange={onSearchTextChange} isSearching={searchInProgress} initialText={firstSearchText} />
      </CardContent>
    </Card>
    <Card className={classes.growingCard}>
      <CardContent>
        <DocumentList documents={props.documentSearchResults} error={props.searchError}></DocumentList>
      </CardContent>
    </Card>
  </>);
}

export default connect(stateToProps, dispatchToProps)(Documents);
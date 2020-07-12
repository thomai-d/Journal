import * as React from 'react';
import { connect } from 'react-redux';
import { FormControl, InputAdornment, TextField, CircularProgress } from '@material-ui/core';
import { Theme, makeStyles, Card, CardContent } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { debounce } from '../../util/debounce';
import { AnyAction, Dispatch, bindActionCreators } from 'redux';
import * as HistoryStore from '../../store/HistoryStore';
import { ApplicationState } from '../../store/configureStore';
import DocumentList from '../controls/DocumentList';
import MuiAlert from '@material-ui/lab/Alert';

const useStyle = makeStyles((theme: Theme) => ({
  searchAdornment: {
    width: '28px'
  },

  form: {
    marginBottom: theme.spacing(1)
  },
  
  alert: {
    maxWidth: '50%'
  },
  
  card: {
    marginTop: theme.spacing(1),
  },

  growingCard: {
    marginTop: theme.spacing(1),
    flex: '1 0'
  },

  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }
}));

const stateToProps = (state: ApplicationState) => {
  return {
    ...state.history
  }
}

const dispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators({
    searchDocuments: HistoryStore.actions.searchDocuments,
    exploreQuery: HistoryStore.actions.exploreQuery
  }, dispatch);

type Props = ReturnType<typeof stateToProps>;
type DispatchProps = ReturnType<typeof dispatchToProps>;

const History = (props: Props & DispatchProps) => {

  const classes = useStyle();

  /* eslint-disable react-hooks/exhaustive-deps */
  const firstSearchText = props.searchText;
  React.useEffect(() => {
    props.searchDocuments(firstSearchText);
    props.exploreQuery(firstSearchText);
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const onSearchTextChange = React.useCallback(debounce(text => {
    props.searchDocuments(text);
    props.exploreQuery(firstSearchText);
  }, 300), []);

  return (
    <>

      <div className={classes.root}>

      <Card className={classes.card}>
        <CardContent>
          <FormControl className={classes.form}>
            <TextField
              defaultValue={props.searchText}
              onChange={(e) => onSearchTextChange(e.currentTarget.value)}
              label="Filter"
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    className={classes.searchAdornment}
                  >
                    {props.documentSearchInProgress ? (
                      <CircularProgress size="1em" />
                    ) : (
                      <Search />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        </CardContent>
      </Card>

      <Card className={classes.growingCard}>
        <CardContent>
          {props.documentSearchError ? (
            <MuiAlert
              className={classes.alert}
              severity="warning"
              variant="filled"
            >
              <span>{props.documentSearchError}</span>
            </MuiAlert>
          ) : (
            <DocumentList
              documents={props.documentSearchResults}
            ></DocumentList>
          )}
        </CardContent>
      </Card>

      <Card className={classes.growingCard}>
        <CardContent>
          <span>{JSON.stringify(props.exploreQueryResult)}</span>
        </CardContent>
      </Card>
      </div>

    </>
  );
}

export default connect(stateToProps, dispatchToProps)(History);
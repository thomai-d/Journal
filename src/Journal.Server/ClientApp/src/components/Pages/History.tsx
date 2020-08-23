import * as React from 'react';
import { connect } from 'react-redux';
import { FormControl, InputAdornment, TextField, CircularProgress, Typography, NativeSelect, InputLabel } from '@material-ui/core';
import { Theme, makeStyles, Card, CardContent } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { debounce } from '../../util/debounce';
import { AnyAction, Dispatch, bindActionCreators } from 'redux';
import * as HistoryStore from '../../store/HistoryStore';
import { ApplicationState } from '../../store/configureStore';
import DocumentList from '../controls/DocumentList';
import MuiAlert from '@material-ui/lab/Alert';
import { GroupByTime } from '../../api/exploreApi';
import { Chart } from 'react-google-charts';

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
  },

  leftGap: {
    marginLeft: theme.spacing(1)
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
    props.exploreQuery(firstSearchText, props.exploreGrouping);
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const onSearchTextChange = React.useCallback(debounce(text => {
    props.searchDocuments(text);
    props.exploreQuery(firstSearchText, props.exploreGrouping);
  }, 300), []);

  const onGroupingChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    props.exploreQuery(props.searchText, event.target.value as GroupByTime);
  }

  console.log(props.exploreQueryResult);
  
  return (
    <>
      <div className={classes.root}>
        <Card className={classes.card}>
          <CardContent>
            <FormControl className={classes.form}>
              <TextField
                defaultValue={props.searchText}
                onChange={(e:any) => onSearchTextChange(e.currentTarget.value)}
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
            {props.exploreQueryResult ? (
              <Chart width={800} height={300} chartType="LineChart" loader={<div>Loading...</div>}
                     data={props.exploreQueryResult}>
              </Chart>
            ) : (
              <Typography>No data</Typography>
            )}

            <br />
            <FormControl className={`${classes.form} ${classes.leftGap}`}>
              <InputLabel htmlFor="grouping-select">Grouping</InputLabel>
              <NativeSelect value={props.exploreGrouping} onChange={onGroupingChange}
                            inputProps={{
                              id: 'grouping-select'
                            }}>
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="year">Year</option>
              </NativeSelect>
            </FormControl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default connect(stateToProps, dispatchToProps)(History);
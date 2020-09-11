import * as React from 'react';
import { connect } from 'react-redux';
import { FormControl, Typography, NativeSelect, InputLabel } from '@material-ui/core';
import { Theme, makeStyles, Card, CardContent } from '@material-ui/core';
import Search from '../controls/Search';
import { AnyAction, Dispatch, bindActionCreators } from 'redux';
import * as HistoryStore from '../../store/HistoryStore';
import { ApplicationState } from '../../store/configureStore';
import DocumentList from '../controls/DocumentList';
import MuiAlert from '@material-ui/lab/Alert';
import { GroupByTime } from '../../api';
import { Chart } from 'react-google-charts';
import { useState } from 'react';

const useStyle = makeStyles((theme: Theme) => ({
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
  },

  form: {
    marginBottom: theme.spacing(1)
  },
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

  const [ firstSearchText ] = useState(props.searchText);

  const onSearchTextChange = (text: string) => {
    props.searchDocuments(text);
    props.exploreQuery(text, props.exploreGrouping);
  };

  const onGroupingChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    props.exploreQuery(props.searchText, event.target.value as GroupByTime);
  }

  const isSearching = props.documentSearchInProgress || props.exploreQueryInProgress;

  return (
    <>
      <div className={classes.root}>
        <Card className={classes.card}>
          <CardContent>
            <Search onChange={onSearchTextChange} isSearching={isSearching} initialText={firstSearchText} />
          </CardContent>
        </Card>

        <Card className={classes.growingCard}>
          <CardContent>
            {props.documentSearchError ? (
              <MuiAlert className={classes.alert} severity="warning" variant="filled" >
                <span>{props.documentSearchError}</span>
              </MuiAlert>
            ) : (
              <DocumentList documents={props.documentSearchResults} ></DocumentList>
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
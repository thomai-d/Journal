import * as React from 'react';
import { connect } from 'react-redux';
import { FormControl, Typography, NativeSelect, InputLabel } from '@material-ui/core';
import { Theme, makeStyles } from '@material-ui/core';
import Search from '../controls/Search';
import { AnyAction, Dispatch, bindActionCreators } from 'redux';
import * as HistoryStore from '../../store/HistoryStore';
import { ApplicationState } from '../../store/configureStore';
import { GroupByTime } from '../../api';
import { Chart } from 'react-google-charts';
import { useState } from 'react';

const useStyle = makeStyles((theme: Theme) => ({
  
  search: {
    position: 'static',
    top: theme.spacing(1),
    left: theme.spacing(1),
  },

  chart: {
    flex: '1 0 0',
  },
  
  noData: {
    alignSelf: 'center',
    justifySelf: 'center',
    margin: 'auto',
  },
}));

const stateToProps = (state: ApplicationState) => {
  return {
    ...state.history
  }
}

const dispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators({
    exploreQuery: HistoryStore.actions.exploreQuery
  }, dispatch);

type Props = ReturnType<typeof stateToProps>;
type DispatchProps = ReturnType<typeof dispatchToProps>;

const History = (props: Props & DispatchProps) => {

  const classes = useStyle();

  const [ firstSearchText ] = useState(props.searchText);

  const onSearchTextChange = (text: string) => {
    props.exploreQuery(text, props.exploreGrouping);
  };

  const onGroupingChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    props.exploreQuery(props.searchText, event.target.value as GroupByTime);
  }

  const isSearching = props.exploreQueryInProgress;
  const hasData = props.exploreQueryResult && props.exploreQueryResult.length > 1;

  return (
    <>
      <Search onChange={onSearchTextChange} isSearching={isSearching} initialText={firstSearchText} />

      {hasData ? (
        <>
          <Chart width={800} height={300} chartType="LineChart" loader={<div>Loading...</div>}
                data={props.exploreQueryResult} className={classes.chart}>
          </Chart>
          <br />
          <FormControl>
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
        </>
      ) : (
        <Typography className={classes.noData} color="textSecondary">No data</Typography>
      )}
    </>
  );
}

export default connect(stateToProps, dispatchToProps)(History);
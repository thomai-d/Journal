import { Reducer as ExploreStore } from 'redux';
import { AppThunkAction } from '.';
import { explore, GroupByTime } from '../api';
import * as LoginStore from './LoginStore';
import { logger } from '../util/logger';
import { resultToChartData } from '../util/google-chart-helper';

export interface ExploreState {
  searchText: string;

  exploreQueryInProgress: boolean;
  exploreQueryResult: any[];
  exploreQuerySearchError: string;
  exploreGrouping: GroupByTime;
}

const defaultState = {
  searchText: '',
  
  exploreQueryInProgress: false,
  exploreQueryResult: [],
  exploreQuerySearchError: '',
  exploreGrouping: 'day'

} as ExploreState;


export interface ExploreQueryStarted {
  type: 'EXPLORE_SEARCH_STARTED';
  searchText: string;
  grouping: GroupByTime;
}

export interface ExploreQuerySucceeded {
  type: 'EXPLORE_SEARCH_SUCCEEDED';
  searchText: string;
  searchResults: any[];
}

export interface ExploreQueryFailed {
  type: 'EXPLORE_SEARCH_FAILED';
  searchText: string;
  error: string;
}

export type KnownAction = ExploreQueryStarted | ExploreQuerySucceeded | ExploreQueryFailed;

export const actions = {

  exploreQuery: (searchText: string, group: GroupByTime): AppThunkAction<KnownAction> => async dispatch => {
    dispatch({
      type: 'EXPLORE_SEARCH_STARTED',
      searchText,
      grouping: group
    });
    
    try {
      const result = await explore(group, searchText);
      const chartData = resultToChartData(result);

      dispatch({
        type: 'EXPLORE_SEARCH_SUCCEEDED',
        searchResults: chartData,
        searchText
      });
    }
    catch(err) {
      logger.err('Explore query failed', undefined, err);
      dispatch({
        type: 'EXPLORE_SEARCH_FAILED',
        searchText,
        error: err.message ? err.message : 'Unknown error'
      });
    }
  }
}

export const reducer: ExploreStore<ExploreState, KnownAction | LoginStore.LoginActions> = (state, action) => {
    if (!state) {
      return defaultState;
    }

    switch (action.type) {

      case 'EXPLORE_SEARCH_STARTED':
        return { ...state, exploreQueryInProgress: true, searchText: action.searchText, exploreGrouping: action.grouping };

      case 'EXPLORE_SEARCH_SUCCEEDED':
        const newState = { ...state, exploreQueryInProgress: false, searchText: action.searchText };

        if (action.searchResults.length === state.exploreQueryResult.length
         && JSON.stringify(action.searchResults) === JSON.stringify(state.exploreQueryResult))
          return newState;

        
        logger.debug('No new results. Keeping old chart.');
        newState.exploreQueryResult = action.searchResults;
        return newState;

      case 'EXPLORE_SEARCH_FAILED':
        return { ...state, exploreQueryInProgress: false, exploreQueryResult: [], searchText: action.searchText, exploreQuerySearchError: action.error };

      case 'LOGOUT':
        return defaultState;
    }

    return state;
}
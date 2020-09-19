import { Reducer as HistoryStore } from 'redux';
import { AppThunkAction } from '.';
import { explore, GroupByTime } from '../api';
import * as LoginStore from './LoginStore';
import { logger } from '../util/logger';
import { resultToChartData } from '../util/google-chart-helper';

export interface HistoryState {
  searchText: string;

  exploreQueryInProgress: boolean;
  exploreQueryResult: any;
  exploreQuerySearchError: string;
  exploreGrouping: GroupByTime;
}

const defaultState = {
  searchText: '',
  
  exploreQueryInProgress: false,
  exploreQueryResult: '',
  exploreQuerySearchError: '',
  exploreGrouping: 'day'

} as HistoryState;


export interface VisualSearchStarted {
  type: 'EXPLORE_SEARCH_STARTED';
  searchText: string;
  grouping: GroupByTime;
}

export interface VisualSearchSucceeded {
  type: 'EXPLORE_SEARCH_SUCCEEDED';
  searchText: string;
  searchResults: any;
}

export interface VisualSearchFailed {
  type: 'EXPLORE_SEARCH_FAILED';
  searchText: string;
  error: string;
}

export type KnownAction = VisualSearchStarted | VisualSearchSucceeded | VisualSearchFailed;

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

export const reducer: HistoryStore<HistoryState, KnownAction | LoginStore.LoginActions> = (state, action) => {
    if (!state) {
      return defaultState;
    }

    switch (action.type) {

      case 'EXPLORE_SEARCH_STARTED':
        return { ...state, exploreQueryInProgress: true, exploreQueryResult: null, searchText: action.searchText, exploreGrouping: action.grouping };
      case 'EXPLORE_SEARCH_SUCCEEDED':
        return { ...state, exploreQueryInProgress: false, exploreQueryResult: action.searchResults, searchText: action.searchText };
      case 'EXPLORE_SEARCH_FAILED':
        return { ...state, exploreQueryInProgress: false, exploreQueryResult: null, searchText: action.searchText, exploreQuerySearchError: action.error };

      case 'LOGOUT':
        return defaultState;
    }

    return state;
}
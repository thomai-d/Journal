import { Reducer as HistoryStore } from 'redux';
import { AppThunkAction } from '.';
import { Document, queryDocuments } from '../api/documentApi';
import { explore } from '../api/exploreApi';
import * as LoginStore from './LoginStore';
import { logger } from '../util/logger';

export interface HistoryState {
  searchText: string;

  documentSearchInProgress: boolean;
  documentSearchResults: Document[];
  documentSearchError: string;

  exploreQueryInProgress: boolean;
  exploreQueryResult: any;
  exploreQuerySearchError: string;
}

const defaultState = {
  searchText: '',
  
  documentSearchInProgress: false,
  documentSearchResults: [],
  documentSearchError: '',

  exploreQueryInProgress: false,
  exploreQueryResult: '',
  exploreQuerySearchError: ''

} as HistoryState;

export interface DocumentSearchStarted {
  type: 'DOCUMENT_SEARCH_STARTED';
  searchText: string;
}

export interface DocumentSearchSucceeded {
  type: 'DOCUMENT_SEARCH_SUCCEEDED';
  searchText: string;
  searchResults: Document[];
}

export interface DocumentSearchFailed {
  type: 'DOCUMENT_SEARCH_FAILED';
  searchText: string;
  error: string;
}

export interface VisualSearchStarted {
  type: 'VISUAL_SEARCH_STARTED';
  searchText: string;
}

export interface VisualSearchSucceeded {
  type: 'VISUAL_SEARCH_SUCCEEDED';
  searchText: string;
  searchResults: any;
}

export interface VisualSearchFailed {
  type: 'VISUAL_SEARCH_FAILED';
  searchText: string;
  error: string;
}

export type KnownAction = DocumentSearchStarted | DocumentSearchSucceeded | DocumentSearchFailed
                        | VisualSearchStarted | VisualSearchSucceeded | VisualSearchFailed;

export const actions = {

  searchDocuments: (searchText: string): AppThunkAction<KnownAction> => async (dispatch) => {
    dispatch({
      type: 'DOCUMENT_SEARCH_STARTED',
      searchText
    });

    const tags = searchText === '' ? []  : searchText.split(' ');

    try {
      const result = await queryDocuments(tags);
      dispatch({
        type: 'DOCUMENT_SEARCH_SUCCEEDED',
        searchResults: result,
        searchText
      });
    }
    catch(err) {
      logger.err('Document search failed', undefined, err);
      dispatch({
        type: 'DOCUMENT_SEARCH_FAILED',
        searchText,
        error: err.message ? err.message : 'Unknown error'
      });
    }
  },

  exploreQuery: (searchText: string): AppThunkAction<KnownAction> => async dispatch => {
    dispatch({
      type: 'VISUAL_SEARCH_STARTED',
      searchText
    });
    
    const tags = searchText === '' ? []  : searchText.split(' ');

    try {
      const result = await explore('year', tags);
      dispatch({
        type: 'VISUAL_SEARCH_SUCCEEDED',
        searchResults: result,
        searchText
      });
    }
    catch(err) {
      logger.err('Explore query failed', undefined, err);
      dispatch({
        type: 'VISUAL_SEARCH_FAILED',
        searchText,
        error: err.message ? err.message : 'Unknown error'
      });
    }
  }
}

export const reducer: HistoryStore<HistoryState, KnownAction | LoginStore.KnownAction> = (state, action) => {
    if (!state) {
      return defaultState;
    }

    switch (action.type) {
      case 'DOCUMENT_SEARCH_STARTED':
        return { ...state, documentSearchInProgress: true, documentSearchResults: [], searchText: action.searchText };
      case 'DOCUMENT_SEARCH_SUCCEEDED':
        return { ...state, documentSearchInProgress: false, documentSearchResults: action.searchResults, searchText: action.searchText };
      case 'DOCUMENT_SEARCH_FAILED':
        return { ...state, documentSearchInProgress: false, documentSearchResults: [], searchText: action.searchText, documentSearchError: action.error };

      case 'VISUAL_SEARCH_STARTED':
        return { ...state, exploreQueryInProgress: true, exploreQueryResult: null, searchText: action.searchText };
      case 'VISUAL_SEARCH_SUCCEEDED':
        return { ...state, exploreQueryInProgress: false, exploreQueryResult: action.searchResults, searchText: action.searchText };
      case 'VISUAL_SEARCH_FAILED':
        return { ...state, exploreQueryInProgress: false, exploreQueryResult: null, searchText: action.searchText, exploreQuerySearchError: action.error };

      case 'LOGOUT':
        return defaultState;
    }

    return state;
}
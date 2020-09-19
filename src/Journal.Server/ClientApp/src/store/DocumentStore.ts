import { queryDocuments, Document } from '../api';
import { LoginActions } from './LoginStore';
import { logger } from '../util/logger';
import { AppThunkAction } from '.';
import { Reducer } from 'redux';

export interface DocumentState {
  searchText:       string;
  searchInProgress: boolean;
  searchResults:    Document[];
  searchError:      string;
}

export const defaultState: DocumentState = {
  searchText: '',
  searchInProgress: false,
  searchResults: [],
  searchError: '',
}

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

export type DocumentActions = DocumentSearchStarted | DocumentSearchSucceeded | DocumentSearchFailed;

export const actions = {
  searchDocuments: (searchText: string): AppThunkAction<DocumentActions> => async (dispatch) => {
    dispatch({
      type: 'DOCUMENT_SEARCH_STARTED',
      searchText
    });

    try {
      const result = await queryDocuments(searchText);
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
}

export const reducer: Reducer<DocumentState, DocumentActions | LoginActions> = (state, action) => {
    if (!state) {
      return defaultState;
    }

    switch (action.type) {
      case 'DOCUMENT_SEARCH_STARTED':
        return { ...state, searchInProgress: true, searchText: action.searchText };

      case 'DOCUMENT_SEARCH_SUCCEEDED':
        // only apply changes if something changed.
        if (action.searchResults.length === state.searchResults.length
         && JSON.stringify(action.searchResults) === JSON.stringify(state.searchResults)) {
           logger.debug('No new documents. Keeping old list.');
           return { ...state, searchInProgress: false, searchError: '' };
         }
        return { searchInProgress: false, searchResults: action.searchResults, searchText: action.searchText, searchError: '' };

      case 'DOCUMENT_SEARCH_FAILED':
        return { searchInProgress: false, searchResults: [], searchText: action.searchText, searchError: action.error };

      case 'LOGOUT':
        return defaultState;
    }

    return state;
}
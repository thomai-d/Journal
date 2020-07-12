import { Reducer as HistoryStore } from 'redux';
import { AppThunkAction } from '.';
import { Document, queryDocuments } from '../api/documentApi';
import * as LoginStore from './LoginStore';

export interface HistoryState {
  searchText: string;
  isSearching: boolean;
  searchResults: Document[];
}

const defaultState = {
  searchText: '',
  isSearching: false,
  searchResults: []
};

export interface SearchStarted {
  type: 'DOCUMENT_SEARCH_STARTED';
  searchText: string;
}

export interface SearchSucceeded {
  type: 'DOCUMENT_SEARCH_SUCCEEDED';
  searchText: string;
  searchResults: Document[];
}

export type KnownAction = SearchStarted | SearchSucceeded;

export const actions = {

  search: (searchText: string): AppThunkAction<KnownAction> => async (dispatch) => {
    dispatch({
      type: 'DOCUMENT_SEARCH_STARTED',
      searchText
    });

    const tags = searchText === '' ? []  : searchText.split(' ');
    const result = await queryDocuments(tags);
      dispatch({
        type: 'DOCUMENT_SEARCH_SUCCEEDED',
        searchResults: result,
        searchText
      });
  }
}

export const reducer: HistoryStore<HistoryState, KnownAction | LoginStore.KnownAction> = (state, action) => {
    if (!state) {
      return defaultState;
    }

    switch (action.type) {
      case 'DOCUMENT_SEARCH_STARTED':
        return { ...state, isSearching: true, searchResults: [], searchText: action.searchText };
      case 'DOCUMENT_SEARCH_SUCCEEDED':
        return { ...state, isSearching: false, searchResults: action.searchResults, searchText: action.searchText };
      case 'LOGOUT':
        return defaultState;
    }

    return state;
}
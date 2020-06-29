import { Reducer as HistoryStore } from 'redux';
import { AppThunkAction } from '.';
import { Document, queryDocuments } from '../api/documentApi';

export interface HistoryState {
  searchText: string;
  isSearching: boolean;
  searchResults: Document[];
}

export interface SearchStarted {
  type: 'SEARCH_STARTED';
  searchText: string;
}

export interface SearchSucceeded {
  type: 'SEARCH_SUCCEEDED';
  searchText: string;
  searchResults: Document[];
}

type KnownAction = SearchStarted | SearchSucceeded;

export const actions = {

  search: (searchText: string): AppThunkAction<KnownAction> => async (dispatch) => {
    dispatch({
      type: 'SEARCH_STARTED',
      searchText
    });

    const tags = searchText === '' ? []  : searchText.split(' ');
    const result = await queryDocuments(tags);
      dispatch({
        type: 'SEARCH_SUCCEEDED',
        searchResults: result,
        searchText
      });
  }
}

export const reducer: HistoryStore<HistoryState, KnownAction> = (state, action) => {
    if (!state) {
      return {
        searchText: '',
        isSearching: false,
        searchResults: []
      };
    }

    switch (action.type) {
      case 'SEARCH_STARTED':
        return { ...state, isSearching: true, searchResults: [], searchText: action.searchText };
      case 'SEARCH_SUCCEEDED':
        return { ...state, isSearching: false, searchResults: action.searchResults, searchText: action.searchText };
    }

    return state;
}
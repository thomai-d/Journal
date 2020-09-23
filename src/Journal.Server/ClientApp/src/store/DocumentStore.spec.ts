import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as sut from './DocumentStore';
import { Document } from '../api';

const testDocument: Document = {
  author: 'hans',
  content: 'hallo',
  id: '1',
  created: '0',
  tags: [],
  values: {}
};

jest.mock('../api', () => {
  return {
    queryDocuments: jest.fn()
  }
});

import { queryDocuments } from '../api';
import { bindActionCreators } from 'redux';

const middlewares = [thunk]
const mockStore = configureMockStore<sut.DocumentState, any>(middlewares)

test('Search documents should succeed with result ', async () => {

  const store = mockStore(sut.defaultState);
  const searchDocuments = bindActionCreators(sut.actions.searchDocuments, store.dispatch);

  (queryDocuments as jest.Mock).mockImplementation(async (searchText: string) => {
    return Promise.resolve([ testDocument ]);
  });

  await searchDocuments('search-text');

  const actions = store.getActions();
  expect(actions.length).toBe(2);
  expect(actions[0].type).toBe('DOCUMENT_SEARCH_STARTED');
  expect(actions[1]).toEqual({
    type: 'DOCUMENT_SEARCH_SUCCEEDED',
    searchResults: [ testDocument ],
    searchText: 'search-text',
  } as sut.DocumentActions);
});
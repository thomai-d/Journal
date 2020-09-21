import { applyMiddleware, combineReducers, compose, createStore, StoreEnhancer } from 'redux';
import thunk from 'redux-thunk';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore, PersistConfig } from 'redux-persist';
import autoMergeLevel1 from 'redux-persist/es/stateReconciler/autoMergeLevel1';
import { actionLogger } from './middleware/actionLogger';
import * as LoginStore from './LoginStore';
import * as ExploreStore from './ExploreStore';
import * as SnackbarStore from './SnackbarStore';
import * as DocumentStore from './DocumentStore';

export interface ApplicationState {
    login: LoginStore.LoginState;
    documents: DocumentStore.DocumentState;
    history: ExploreStore.ExploreState;
    snackbar: SnackbarStore.SnackbarState;
}

export default function configureStore(history: History, initialState?: ApplicationState) {
    const middleware = [
        thunk,
        actionLogger,
        routerMiddleware(history)
    ];

    const rootReducer = combineReducers({
        login: LoginStore.reducer,
        history: ExploreStore.reducer,
        snackbar: SnackbarStore.reducer,
        documents: DocumentStore.reducer,
        router: connectRouter(history)
    });

    type RootState = ReturnType<typeof rootReducer>;
    const persistConfig = {
        key: 'root',
        storage,
        stateReconciler: autoMergeLevel1
    } as PersistConfig<RootState>;

    const persistedReducer = persistReducer(persistConfig, rootReducer)

    const enhancers:StoreEnhancer[] = [];
    const windowIfDefined = typeof window === 'undefined' ? null : window as any;
    if (windowIfDefined && windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__) {
        enhancers.push(windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__());
    }

    const store = createStore(
        persistedReducer,
        initialState,
        compose(applyMiddleware(...middleware), ...enhancers)
    );

    const persistor = persistStore(store);
    return { store, persistor }
}
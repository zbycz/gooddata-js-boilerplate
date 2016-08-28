import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from './reducers/root_reducer';
import initialState from './reducers/initial_state';

import * as Paths from './constants/StatePaths';

const middleware = [thunk];

if (DEBUG || TESTING) {
    const fsaMiddleware = require('redux-validate-fsa');
    const fsa = fsaMiddleware();
    middleware.push(fsa);
}

const enhancer = compose(
    applyMiddleware(...middleware),
    DEBUG && window.devToolsExtension ? window.devToolsExtension() : f => f
);

export default function(reducer = rootReducer) {
    return createStore(reducer, initialState.setIn(Paths.IS_EMBEDDED, window.EMBEDDED || false), enhancer);
}

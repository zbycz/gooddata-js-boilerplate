import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

const appReducer = (state, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

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

export default function(reducer = appReducer) {
    return createStore(reducer, {}, enhancer);
}

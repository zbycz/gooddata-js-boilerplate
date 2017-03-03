import { createStore, applyMiddleware, compose } from 'redux';

const appReducer = (state, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

const middlewares = [];

if (DEBUG || TESTING) {
    const fsaMiddleware = require('redux-validate-fsa');

    const fsa = fsaMiddleware();
    middlewares.push(fsa);
}

const enhancer = compose(
    applyMiddleware(...middlewares),
    DEBUG && window.devToolsExtension ? window.devToolsExtension() : f => f
);

export default function(reducer = appReducer) {
    return createStore(reducer, {}, enhancer);
}

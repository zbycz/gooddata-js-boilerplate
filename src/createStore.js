import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { filtersReducer, REDUX_STATE_PATH } from '@gooddata/react-components/dist/redux';

const appReducer = (state = {}, action) => {
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

const rootReducer = combineReducers({
    app: appReducer,
    [REDUX_STATE_PATH]: filtersReducer
});

export default function(reducer = rootReducer) {
    return createStore(reducer, {}, enhancer);
}

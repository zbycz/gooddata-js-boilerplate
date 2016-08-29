// use import syntax instead of require, babel implementations are different
import 'babel-polyfill';
require('./styles/app');

import * as React from 'react';
import ReactDOM from 'react-dom';

import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import createStore from './createStore';

const store = createStore();

if (DEBUG) {
    const Immutable = require('immutable');
    const installDevTools = require('immutable-devtools');
    installDevTools(Immutable);
}

function renderApplication() {
    ReactDOM.render(
        <Provider store={store}>
            <IntlProvider locale="en">
                <div>Hello world!</div>
            </IntlProvider>
        </Provider>,
        document.getElementById('app-GDC_APP_PATH')
    );
}

// Load Intl polyfill only if needed
// see http://ianobermiller.com/blog/2015/06/01/conditionally-load-intl-polyfill-webpack/
// and https://webpack.github.io/docs/code-splitting.html
if (!window.Intl) {
    require.ensure(['intl', 'intl/locale-data/jsonp/en.js'], () => {
        require('intl');
        require('intl/locale-data/jsonp/en.js');
        renderApplication();
    });
} else {
    renderApplication();
}

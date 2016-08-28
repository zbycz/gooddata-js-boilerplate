// use import syntax instead of require, babel implementations are different
import 'babel-polyfill';
require('./styles/app');

import formats from 'goodstrap/packages/core/formats';

import * as React from 'react';
import ReactDOM from 'react-dom';

import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import translations from './translations/en';

import Root from './containers/Root';
import { getCurrentHash, getRouteParams } from './utils/location';

import createStore from './createStore';

const currentHash = getCurrentHash();
const routeParams = getRouteParams(currentHash);

const store = createStore();

if (DEBUG) {
    const Immutable = require('immutable');
    const installDevTools = require('immutable-devtools');
    installDevTools(Immutable);
}


function renderApplication() {
    ReactDOM.render(
        <Provider store={store}>
            <IntlProvider locale="en" messages={translations} formats={formats}>
                <Root
                    datasetId={routeParams.datasetId}
                    projectId={routeParams.projectId}
                />
            </IntlProvider>
        </Provider>,
        document.getElementById('app-analyze')
    );
}

// Load Intl polyfill only if needed
// see http://ianobermiller.com/blog/2015/06/01/conditionally-load-intl-polyfill-webpack/
// and https://webpack.github.io/docs/code-splitting.html
if (!window.Intl) {
    // Embedded index.html is placed in subdirectory,
    // so we need to fix publicPath for additional chunks
    // see http://webpack.github.io/docs/configuration.html#output-publicpath
    if (window.EMBEDDED) {
        __webpack_public_path__ = '../'; // eslint-disable-line
    }
    require.ensure(['intl', 'intl/locale-data/jsonp/en.js'], () => {
        require('intl');
        require('intl/locale-data/jsonp/en.js');
        renderApplication();
    });
} else {
    renderApplication();
}

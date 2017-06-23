import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';

import Root from './containers/Root';

import './styles/app.scss';

import createStore from './createStore';

const store = createStore();

if (DEBUG) {
    const Immutable = require('immutable');
    const installDevTools = require('immutable-devtools');

    installDevTools(Immutable);
}

function renderApplication(RootComponent) {
    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <IntlProvider locale="en">
                    <RootComponent />
                </IntlProvider>
            </Provider>
        </AppContainer>,
        document.getElementById('app')
    );
}

if (module.hot) {
    module.hot.accept('./containers/Root', () => {
        renderApplication(Root);
    });
}

// Load Intl polyfill only if needed (e.g. old Safari)
// see http://ianobermiller.com/blog/2015/06/01/conditionally-load-intl-polyfill-webpack/
// and https://webpack.github.io/docs/code-splitting.html
if (!window.Intl) {
    require.ensure(['intl', 'intl/locale-data/jsonp/en.js'], () => {
        require('intl');
        require('intl/locale-data/jsonp/en');

        renderApplication(Root);
    });
} else {
    renderApplication(Root);
}

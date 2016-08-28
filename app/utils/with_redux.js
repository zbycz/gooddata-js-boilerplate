import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { identity } from 'lodash';
import createStore from '../createStore';

export default function withRedux(WrappedComponent, reducer = identity) {
    const store = createStore(reducer);

    return class extends Component {
        render() {
            return (
                <Provider store={store}>
                    <WrappedComponent {...this.props} />
                </Provider>
            );
        }
    };
}

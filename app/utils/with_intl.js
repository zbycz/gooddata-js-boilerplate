import React, { Component } from 'react';
import { IntlProvider } from 'react-intl';

import translations from '../translations/en';


export default function withIntl(WrappedComponent, intlOptions = { locale: 'en', messages: translations }) {
    return class extends Component {
        render() {
            return (
                <IntlProvider {...intlOptions}>
                    <WrappedComponent {...this.props} />
                </IntlProvider>
            );
        }
    };
}

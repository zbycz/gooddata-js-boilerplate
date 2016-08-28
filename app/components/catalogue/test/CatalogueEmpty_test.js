import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { IntlProvider } from 'react-intl';
import translations from '../../../translations/en';

import CatalogueEmpty from '../CatalogueEmpty';

let { renderIntoDocument, findRenderedDOMComponentWithClass } = ReactTestUtils;

describe('Catalogue empty message', () => {
    function render(query) {
        return renderIntoDocument(
            <IntlProvider locale="en" messages={translations}>
                <CatalogueEmpty search={query} />
            </IntlProvider>
        );
    }
    const queryString = 'some query';

    it('should render not found string', () => {
        const component = render(queryString);
        const notFoundElement = findRenderedDOMComponentWithClass(component, 's-not-matching-message');
        const notFoundString = notFoundElement.textContent;

        expect(notFoundString).to.contain(queryString);
        expect(notFoundString).to.contain('No data matching');
    });
});

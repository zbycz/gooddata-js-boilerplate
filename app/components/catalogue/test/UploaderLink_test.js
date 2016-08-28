import React from 'react';
import UploaderLink from '../UploaderLink';

import ReactTestUtils from 'react-addons-test-utils';
import { IntlProvider } from 'react-intl';
import translations from '../../../translations/en';

let { renderIntoDocument, findRenderedDOMComponentWithClass } = ReactTestUtils;

describe('UploaderLink', () => {
    function render(url) {
        return renderIntoDocument(
            <IntlProvider locale="en" messages={translations}>
                <UploaderLink href={url} />
            </IntlProvider>
        );
    }

    it('renders anchor with link to data page', () => {
        const section = render('http://example.com');

        const a = findRenderedDOMComponentWithClass(section, 's-btn-add_data');

        expect(a.getAttribute('href')).to.equal('http://example.com');
    });
});

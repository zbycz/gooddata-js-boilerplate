import { fromJS } from 'immutable';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import FactBubbleContent from '../FactBubbleContent';
import { IntlProvider } from 'react-intl';

import translations from '../../../translations/en';

let {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    findRenderedDOMComponentWithTag
} = ReactTestUtils;

describe('FactBubbleContent', () => {
    let dataset = fromJS({ title: 'title1' });

    function render(factDataset) {
        return renderIntoDocument(
            <IntlProvider locale="en" messages={translations}>
                <FactBubbleContent dataset={factDataset} />
            </IntlProvider>
        );
    }

    it('renders dataset if provided', () => {
        let tag = findRenderedDOMComponentWithClass(render(dataset), 's-dataset-name');
        expect(tag.textContent).to.equal(dataset.get('title'));
    });

    it('renders loading if no dataset provided', () => {
        let loading = findRenderedDOMComponentWithTag(render(), 'p');
        expect(loading.textContent).to.contain('Loading');
    });
});

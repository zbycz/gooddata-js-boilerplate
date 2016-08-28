import { fromJS } from 'immutable';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import MetricBubbleContent from '../MetricBubbleContent';
import { IntlProvider } from 'react-intl';

import translations from '../../../translations/en';

let {
    renderIntoDocument,
    scryRenderedDOMComponentsWithClass,
    findRenderedDOMComponentWithClass,
    findRenderedDOMComponentWithTag
} = ReactTestUtils;

describe('MetricBubbleContent', () => {
    function render(maql) {
        return renderIntoDocument(
            <IntlProvider locale="en" messages={translations}>
                <MetricBubbleContent maql={maql} />
            </IntlProvider>
        );
    }

    it('renders maql if provided', () => {
        let maql = fromJS([
            { category: 'class1', title: 'element1' },
            { category: 'class2', title: 'element2' },
            { title: 'element3' }
        ]);

        let content = render(maql);

        let tags = scryRenderedDOMComponentsWithClass(content, 'adi-maql-segment');
        expect(tags).to.have.length(2);
        tags.forEach((tag, idx) => {
            expect(tag.textContent).to.contain(maql.getIn([idx, 'title']));
        });

        let maqlText = findRenderedDOMComponentWithClass(content, 'adi-metric-maql');
        maql.forEach(m => expect(maqlText.textContent).to.contain(m.get('title')));
    });

    it('renders loading if no maql provided', () => {
        let loading = findRenderedDOMComponentWithTag(render(), 'p');
        expect(loading.textContent).to.contain('Loading');
    });
});

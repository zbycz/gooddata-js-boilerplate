import { fromJS } from 'immutable';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import AttributeBubbleContent from '../AttributeBubbleContent';
import withIntl from '../../../utils/with_intl';

let {
    renderIntoDocument,
    scryRenderedDOMComponentsWithClass,
    findRenderedDOMComponentWithClass,
    findRenderedDOMComponentWithTag
} = ReactTestUtils;

describe('AttributeBubbleContent', () => {
    const elements = fromJS([
        { title: '' },
        { title: 'element1' },
        { title: 'element2' }
    ]);
    const Wrapped = withIntl(AttributeBubbleContent);

    function render(attrElements, totalElementsCount) {
        return renderIntoDocument(
            <Wrapped elements={attrElements} totalElementsCount={totalElementsCount} />
        );
    }

    it('renders elements if provided', () => {
        const tags = scryRenderedDOMComponentsWithClass(render(elements), 's-attribute-element');
        expect(tags).to.have.length(3);
        elements.forEach((element, idx) => {
            expect(tags[idx].textContent).to.contain(element.get('title'));
        });
    });

    it('should replace blank title with "(empty value)" text', () => {
        const tags = scryRenderedDOMComponentsWithClass(render(elements), 's-attribute-element');
        const emptyTitleTag = tags[0];
        expect(emptyTitleTag.textContent).to.equal('(empty value)');
    });

    it('renders total elements text', () => {
        const more = findRenderedDOMComponentWithClass(render(elements, 5), 'adi-attr-elements-more');
        expect(more.textContent).to.contain(' 2 ');
    });

    it('renders loading if no elements provided', () => {
        const loading = findRenderedDOMComponentWithTag(render(null), 'p');
        expect(loading.textContent).to.contain('Loading');
    });
});

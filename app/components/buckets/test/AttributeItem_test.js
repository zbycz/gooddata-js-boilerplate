import { Map } from 'immutable';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import withIntl from '../../../utils/with_intl';
import AttributeItem from '../AttributeItem';

const {
    renderIntoDocument,
    findRenderedDOMComponentWithClass
} = ReactTestUtils;

describe('AttributeItem', () => {
    function render(source) {
        const Wrapped = withIntl(AttributeItem);
        return renderIntoDocument(
            <Wrapped
                id={'id'}
                onSelect={() => {}}
                onOnly={() => {}}
                source={source}
            />
        );
    }

    it('should replace blank title with "(empty value)" text', () => {
        const source = Map({
            title: ''
        });
        const content = findRenderedDOMComponentWithClass(render(source), 'content');
        expect(content.textContent).to.contain('(empty value)');
    });
});

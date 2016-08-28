import { fromJS } from 'immutable';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';

import SimpleBucketItem from '../SimpleBucketItem';

import withDragDrop from '../../../utils/with_drag_drop_context';
import withIntl from '../../../utils/with_intl';
import withRedux from '../../../utils/with_redux';

let {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    scryRenderedDOMComponentsWithClass
} = ReactTestUtils;


describe('SimpleBucketItem', () => {
    function render(bucketItem) {
        const Wrapped = withDragDrop(withIntl(withRedux(SimpleBucketItem)));

        return renderIntoDocument(
            <Wrapped
                bucketItem={bucketItem}
                onShowBubble={() => {}}
            />
        );
    }

    describe('date configuration', () => {
        it('should render the date configuration for date item', () => {
            const dateItem = {
                isDate: true,
                dateDataSet: {
                    attributes: []
                },
                attribute: {}
            };

            const bucketComponent = render(fromJS(dateItem));

            findRenderedDOMComponentWithClass(bucketComponent, 's-date-configuration');
        });

        it('should be hidden for non dates', () => {
            const metric = {
                isDate: false,
                attribute: {}
            };

            const bucketComponent = render(fromJS(metric));

            const dateConfigutation = scryRenderedDOMComponentsWithClass(bucketComponent, 's-date-configuration');

            expect(dateConfigutation).to.have.length(0);
        });
    });

    it('should render catalogue list item', () => {
        const attribute = {
            isDate: false,
            attribute: {
                identifier: 'account'
            }
        };

        const bucketComponent = render(fromJS(attribute));

        findRenderedDOMComponentWithClass(bucketComponent, 's-id-account');
    });
});

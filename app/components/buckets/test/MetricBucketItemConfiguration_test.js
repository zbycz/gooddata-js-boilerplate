import { fromJS } from 'immutable';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import withRedux from '../../../utils/with_redux';
import withIntl from '../../../utils/with_intl';

import MetricBucketItemConfiguration from '../MetricBucketItemConfiguration';
import { bucketItem } from '../../../models/bucket_item';
import { decoratedBucket } from '../../../models/bucket';
import * as StatePaths from '../../../constants/StatePaths';

let {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    Simulate: {
        change,
        mouseEnter
    }
} = ReactTestUtils;

let methods = [
    'onSetAttributeAggregation',
    'onAddAttributeFilter',
    'onShowBubble'
];

describe('MetricBucketItemConfiguration', () => {
    let bucket, item, items, callbacks;

    function setupProjectId(state) {
        return state.setIn(StatePaths.PROJECT_ID, 'my project');
    }

    function render(_item) {
        const Wrapped = withRedux(withIntl(MetricBucketItemConfiguration), setupProjectId);

        return renderIntoDocument(
            <Wrapped
                bucketItem={_item}
                onSetAttributeAggregation={callbacks.onSetAttributeAggregation}
                onShowBubble={callbacks.onShowBubble}
            />
        );
    }

    beforeEach(() => {
        item = bucketItem({ attribute: 'fact.spend_analysis.cart_additions' });

        items = fromJS({
            'fact.spend_analysis.cart_additions': {
                id: 'fact.spend_analysis.cart_additions',
                identifier: 'fact.spend_analysis.cart_additions',
                isAvailable: true,
                summary: '',
                title: 'Cart Additions',
                type: 'fact',
                uri: '/gdc/md/TeamOneGoodSales1/obj/15418'
            }
        });

        bucket = decoratedBucket(fromJS({ keyName: 'metrics', items: [item] }), items);

        callbacks = methods.reduce((memo, name) => {
            memo[name] = sinon.spy();
            return memo;
        }, {});
    });

    it('triggers onSetAttributeAggregation when user selects aggregation', () => {
        let config = render(bucket.getIn(['items', 0])),
            select = findRenderedDOMComponentWithClass(config, 's-fact-aggregation-switch');

        change(select, { target: { value: 'AVG' } });
        expect(callbacks.onSetAttributeAggregation).to.be.calledWith(item, 'AVG');
    });

    it('triggers onShowBubble when mouse moves over icon', () => {
        let config = render(bucket.getIn(['items', 0]));

        mouseEnter(findRenderedDOMComponentWithClass(config, 'inlineBubbleHelp'));

        expect(callbacks.onShowBubble).calledWith(items.get('fact.spend_analysis.cart_additions'));
    });
});

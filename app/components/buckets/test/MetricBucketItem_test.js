import { fromJS } from 'immutable';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import withRedux from '../../../utils/with_redux';
import withIntl from '../../../utils/with_intl';

import { MetricBucketItem } from '../MetricBucketItem';
import { bucketItem } from '../../../models/bucket_item';
import { decoratedBucket } from '../../../models/bucket';
import * as StatePaths from '../../../constants/StatePaths';

const {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    scryRenderedDOMComponentsWithClass,
    Simulate: {
        click,
        change
    }
} = ReactTestUtils;

describe('MetricBucketItem', () => {
    let bucket, item, items;

    function setupProjectId(state) {
        return state.setIn(StatePaths.PROJECT_ID, 'my project');
    }

    function render(props) {
        const Wrapped = withRedux(withIntl(MetricBucketItem), setupProjectId);

        return renderIntoDocument(
            <Wrapped {...props} />
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
    });

    it('should render metric title in header', () => {
        const props = { bucketItem: bucket.getIn(['items', 0]) };
        const config = render(props);
        const header = findRenderedDOMComponentWithClass(config, 's-title');

        expect(header.textContent).to.equal(bucket.getIn(['items', 0]).get('metricTitle'));
    });

    it('should not render content when item is collapsed', () => {
        const props = { bucketItem: bucket.getIn(['items', 0]) };
        const config = render(props);
        const content = scryRenderedDOMComponentsWithClass(config, 'adi-metric-bucket-item-configuration');

        expect(content.length).to.equal(0);
    });

    it('should render content when item is expanded', () => {
        const props = {
            bucketItem: bucket.getIn(['items', 0]).set('collapsed', false)
        };
        const config = render(props);
        const content = scryRenderedDOMComponentsWithClass(config, 'adi-metric-bucket-item-configuration');

        expect(content.length).to.equal(1);
    });

    it('triggers setBucketItemCollapsed when user expands header', () => {
        const setBucketItemCollapsed = sinon.spy();
        const props = {
            bucketItem: bucket.getIn(['items', 0]),
            setBucketItemCollapsed
        };
        const config = render(props);
        const select = findRenderedDOMComponentWithClass(config, 's-bucket-item-header');

        click(select);
        expect(setBucketItemCollapsed).calledWith({ item, collapsed: false });
    });

    it('triggers setBucketItemCollapsed when user collapses header', () => {
        const setBucketItemCollapsed = sinon.spy();
        const props = {
            bucketItem: bucket.getIn(['items', 0]).set('collapsed', false),
            setBucketItemCollapsed
        };
        const config = render(props);
        const select = findRenderedDOMComponentWithClass(config, 's-bucket-item-header');

        click(select);
        expect(setBucketItemCollapsed).calledWith({ item, collapsed: true });
    });

    it('should trigger setBucketItemAggregation on select change', () => {
        const setBucketItemAggregation = sinon.spy();
        const props = {
            bucketItem: bucket.getIn(['items', 0]).set('collapsed', false),
            setBucketItemAggregation
        };
        const config = render(props);
        const select = findRenderedDOMComponentWithClass(config, 's-fact-aggregation-switch');

        const event = { target: { value: 'SUM' } };

        change(select, event);
        expect(setBucketItemAggregation).to.be.calledOnce();
    });
});

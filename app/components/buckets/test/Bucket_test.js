import { fromJS } from 'immutable';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';

import Bucket from '../Bucket';
import { bucketItem } from '../../../models/bucket_item';
import { INITIAL_MODEL, decoratedBucket } from '../../../models/bucket';

import withIntl from '../../../utils/with_intl';
import withRedux from '../../../utils/with_redux';
import withDragDrop from '../../../utils/with_drag_drop_context';

let {
    renderIntoDocument,
    scryRenderedDOMComponentsWithClass
} = ReactTestUtils;

describe('Bucket', () => {
    let bucket, items;

    const Wrapped = withRedux(withDragDrop(withIntl(Bucket)));

    function render(_bucket, props = {}) {
        return renderIntoDocument(
            <Wrapped
                buckets={INITIAL_MODEL.set('original', INITIAL_MODEL)}
                bucket={_bucket}
                visualizationType="column"
                {...props}
            />
        );
    }

    beforeEach(() => {
        items = fromJS({
            'fact.spend_analysis.cart_additions': {
                id: 'fact.spend_analysis.cart_additions',
                identifier: 'fact.spend_analysis.cart_additions',
                isAvailable: true,
                summary: '',
                title: 'Cart Additions',
                type: 'fact',
                uri: '/gdc/md/TeamOneGoodSales1/obj/15418'
            },
            'aaeFKXFYiCc0': {
                expression: 'SELECT SUM([/gdc/md/TeamOneGoodSales1/obj/15417])',
                format: '[>=1000000000]$#,,,.0 B;[<=-1000000000]-$#,,,.0 B;[>=1000000]$#,,.0 M;[<=-1000000]-$#,,.0 M;[>=1000]$#,.0 K;[<=-1000]-$#,.0 K;$#,##0',
                id: 'aaeFKXFYiCc0',
                identifier: 'aaeFKXFYiCc0',
                isAvailable: true,
                summary: '',
                title: 'Awareness',
                type: 'metric',
                uri: '/gdc/md/TeamOneGoodSales1/obj/16212'
            }
        });

        bucket = decoratedBucket(fromJS({
            keyName: 'metrics', items: [
                bucketItem({ attribute: 'aaeFKXFYiCc0' }),
                bucketItem({ attribute: 'fact.spend_analysis.cart_additions' })
            ]
        }), items);
    });

    it('renders bucket items', () => {
        let config = render(bucket),
            bucketItems = scryRenderedDOMComponentsWithClass(config, 's-bucket-item');

        expect(bucketItems.length).to.equal(2);
    });
});

import { fromJS, List } from 'immutable';

import { bucketItem } from '../bucket_item';
import { decoratedBucket } from '../bucket';

describe('Decorated Bucket', () => {
    let items, bucket, decorated;

    beforeEach(() => {
        items = fromJS({
            'attr.account_details.retail_company': {
                dateType: undefined,
                dfIdentifier: 'label.account_details.retail_company',
                dfUri: '/gdc/md/TeamOneGoodSales1/obj/15366',
                dimensionUri: '/gdc/md/TeamOneGoodSales1/obj/15125',
                elementsUri: '/gdc/md/TeamOneGoodSales1/obj/15366/elements',
                granularity: 'attr.account_details.retail_company',
                id: 'attr.account_details.retail_company',
                identifier: 'attr.account_details.retail_company',
                isAvailable: true,
                summary: '',
                title: 'Account ID',
                type: 'attribute',
                uri: '/gdc/md/TeamOneGoodSales1/obj/15365'
            },
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

        bucket = fromJS({ keyName: 'metrics', items: [
            bucketItem({ attribute: 'attr.account_details.retail_company' }),
            bucketItem({ attribute: 'fact.spend_analysis.cart_additions' }),
            bucketItem({ attribute: 'aaeFKXFYiCc0' })
        ] });
    });

    function createDecoratedBucket(item) {
        return decoratedBucket(item, items, List(), List());
    }

    beforeEach(() => {
        decorated = createDecoratedBucket(bucket);
    });

    it('should decorate buckets', () => {
        decorated.get('items').forEach(item => {
            expect(item.get('attribute')).to.equal(items.get(item.getIn(['attribute', 'id'])));
            expect(item.get('isMetric')).to.equal(true);
        });
    });
});

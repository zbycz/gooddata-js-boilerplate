import { range } from 'lodash';
import { fromJS } from 'immutable';

import { bucketItem, decoratedBucketItem } from '../bucket_item';
import { decoratedDateDataSets } from '../date_dataset';
import { DATE_DATASET_ATTRIBUTE } from '../date_item';
import { metricAttributeFilter } from '../metric_attribute_filter';

describe('Decorated Bucket Item', () => {
    let bucket, itemCache, dateDataSets, item, decorated, elements;

    const dateDataSet = {
        attributes: [{
            dateType: 'GDC.time.date',
            dfIdentifier: 'date.date.mmddyyyy',
            dfUri: '/gdc/md/TeamOneGoodSales1/obj/15203',
            dimensionUri: '/gdc/md/TeamOneGoodSales1/obj/15174',
            elementsUri: '/gdc/md/TeamOneGoodSales1/obj/15203/elements',
            granularity: 'date.date',
            identifier: 'date.date',
            summary: 'Date',
            title: 'Date (Date)',
            uri: '/gdc/md/TeamOneGoodSales1/obj/15200',
            label: 'Date'
        }, {
            dateType: 'GDC.time.week_us',
            dfIdentifier: 'date.aa281lMifn6q',
            dfUri: '/gdc/md/TeamOneGoodSales1/obj/15259',
            dimensionUri: '/gdc/md/TeamOneGoodSales1/obj/15174',
            elementsUri: '/gdc/md/TeamOneGoodSales1/obj/15259/elements',
            granularity: 'date.euweek',
            identifier: 'date.euweek',
            summary: 'Week/Year based on EU Weeks (Mon-Sun).',
            title: 'Week (Sun-Sat)/Year (Date)',
            uri: '/gdc/md/TeamOneGoodSales1/obj/15254',
            label: 'Week (Sun-Sat)'
        }],
        id: 'date.dim_date',
        identifier: 'date.dim_date',
        isAvailable: true,
        summary: 'Date dimension (Date)',
        title: 'Date dimension (Date)',
        type: 'dimension',
        uri: '/gdc/md/TeamOneGoodSales1/obj/15174',
        attributeTitle: '',
        availabilityTitle: '',
        isDisabled: false
    };

    function createBucketItem(id, filters = []) {
        return bucketItem({ attribute: id, filters });
    }

    function createDecoratedBucketItem(_item) {
        return decoratedBucketItem(_item, bucket, itemCache, dateDataSets);
    }

    beforeEach(() => {
        bucket = fromJS({
            keyName: 'metrics'
        });

        itemCache = fromJS({
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
            },
            'aaeFKXFYiCc0_long': {
                expression: 'SELECT SUM([/gdc/md/TeamOneGoodSales1/obj/15417])',
                format: '[>=1000000000]$#,,,.0 B;[<=-1000000000]-$#,,,.0 B;[>=1000000]$#,,.0 M;[<=-1000000]-$#,,.0 M;[>=1000]$#,.0 K;[<=-1000]-$#,.0 K;$#,##0',
                id: 'aaeFKXFYiCc0',
                identifier: 'aaeFKXFYiCc0',
                isAvailable: true,
                summary: '',
                title: 'Awareness_klsjfjkldslfkajsdagkllksdsl;fkjsajlk;flkjafdlksa;flkasjdfjksdlafhjdsjfklsafkjahsnljcshjamldfkjhmxfdjksalmdfhxadklskfjahmxjksdalmkfjxhmajksflxmdaskdjfhjkalhdsjkljkdsahfjkasldfjkasdhfjklasdkljfhahjsdklfkljahjkasdfkjlahjdksfakjsdhfmxs_end',
                type: 'metric',
                uri: '/gdc/md/TeamOneGoodSales1/obj/16212'
            }
        });

        dateDataSets = decoratedDateDataSets(fromJS({
            available: [dateDataSet],
            unavailable: [],
            dateDataSet
        }));

        elements = fromJS(range(1, 50).map(idx => ({ uri: `/${idx}`, title: `element ${idx}` })));
    });

    describe('basic tests', () => {
        beforeEach(() => {
            item = createBucketItem('aaeFKXFYiCc0');
            decorated = createDecoratedBucketItem(item);
        });

        describe('raw item', () => {
            it('should be collapsed', () => {
                expect(item.get('collapsed')).to.equal(true);
            });
        });

        describe('decorated item', () => {
            it('should point to original object', () => {
                expect(decorated.get('original')).to.equal(item);
            });

            it('attribute should be set to catalogue item', () => {
                let attribute = decorated.get('attribute');
                expect(attribute).to.equal(itemCache.get(attribute.get('id')));
            });

            it('filters should be set correctly', () => {
                item = createBucketItem('aaeFKXFYiCc0', [
                    metricAttributeFilter({}),
                    metricAttributeFilter({})
                ]);
                decorated = createDecoratedBucketItem(item);

                expect(decorated.getIn(['filters', 0, 'original'])).to.equal(item.getIn(['filters', 0]));
                expect(decorated.getIn(['filters', 1, 'original'])).to.equal(item.getIn(['filters', 1]));
            });
        });
    });

    describe('metric', () => {
        beforeEach(() => {
            item = createBucketItem('aaeFKXFYiCc0');
            decorated = createDecoratedBucketItem(item);
        });

        it('isDate should be false', () => {
            expect(decorated.get('isDate')).to.equal(false);
        });

        it('aggregation should be set to null', () => {
            expect(decorated.get('aggregation')).to.equal(null);
        });

        it('metricTitle should be set to title', () => {
            expect(decorated.get('metricTitle')).to.equal(decorated.getIn(['attribute', 'title']));
        });
    });

    describe('attribute based metric', () => {
        beforeEach(() => {
            item = createBucketItem('attr.account_details.retail_company');
            decorated = createDecoratedBucketItem(item);
        });

        it('isDate should be false', () => {
            expect(decorated.get('isDate')).to.equal(false);
        });

        it('aggregation should be set to COUNT by default', () => {
            expect(decorated.get('aggregation')).to.equal('COUNT');
        });

        it('metricTitle should be correctly set', () => {
            expect(decorated.get('metricTitle')).to.equal('Count of Account ID');
        });
    });

    describe('fact based metric', () => {
        beforeEach(() => {
            item = createBucketItem('fact.spend_analysis.cart_additions');
            decorated = createDecoratedBucketItem(item);
        });

        it('isDate should be false', () => {
            expect(decorated.get('isDate')).to.equal(false);
        });

        it('aggregation should be set to SUM by default', () => {
            expect(decorated.get('aggregation')).to.equal('SUM');
        });

        it('metricTitle should be correctly set', () => {
            expect(decorated.get('metricTitle')).to.equal('Sum of Cart Additions');
        });
    });

    describe('date metric', () => {
        beforeEach(() => {
            item = createBucketItem(DATE_DATASET_ATTRIBUTE);
            decorated = createDecoratedBucketItem(item);
        });

        it('isDate should be true', () => {
            expect(decorated.get('isDate')).to.equal(true);
        });

        it('dateDataSet should be correctly set', () => {
            expect(decorated.get('dateDataSet')).to.eql(dateDataSets.getIn(['items', 0]));
        });

        it('granularity should be correctly set', () => {
            expect(decorated.get('granularity')).to.eql(dateDataSets.getIn(['items', 0, 'attributes', 1]));
        });
    });

    describe('with filters', () => {
        beforeEach(() => {
            item = createBucketItem('', [
                metricAttributeFilter({
                    attribute: 'attr.account_details.retail_company',
                    selectedElements: [elements.get(0), elements.get(2)],
                    allElements: elements,
                    isInverted: false,
                    totalElementsCount: 3
                })
            ]);
        });

        describe('metric', () => {
            beforeEach(() => {
                item = item.set('attribute', 'aaeFKXFYiCc0');
                decorated = createDecoratedBucketItem(item);
            });

            it('metricAxisLabel should be correctly set', () => {
                expect(decorated.get('metricAxisLabel')).to.equal('Awareness (Account ID: element 1, element 3)');
            });

            it('metrciAxisLabel should be cropped to 255 characters', () => {
                item = item.set('attribute', 'aaeFKXFYiCc0_long');
                decorated = createDecoratedBucketItem(item);

                item = item.setIn(['filters', 0, 'selectedElements'], fromJS(range(1, 3).map(idx => elements.get(idx))));
                decorated = createDecoratedBucketItem(item);

                expect(decorated.get('metricAxisLabel').length).to.equal(255);
            });
        });

        describe('attribute', () => {
            beforeEach(() => {
                item = item.set('attribute', 'attr.account_details.retail_company');
                decorated = createDecoratedBucketItem(item);
            });

            it('metricAxisLabel should be correctly set', () => {
                expect(decorated.get('metricAxisLabel')).to.equal('Count of Account ID (Account ID: element 1, element 3)');
            });

            it('metrciAxisLabel should be cropped to 255 characters', () => {
                item = item.set('attribute', 'aaeFKXFYiCc0_long');
                decorated = createDecoratedBucketItem(item);

                item = item.setIn(['filters', 0, 'selectedElements'], fromJS(range(1, 3).map(idx => elements.get(idx))));
                decorated = createDecoratedBucketItem(item);

                expect(decorated.get('metricAxisLabel').length).to.equal(255);
            });
        });

        describe('fact', () => {
            beforeEach(() => {
                item = item.set('attribute', 'fact.spend_analysis.cart_additions');
                decorated = createDecoratedBucketItem(item);
            });

            it('metricAxisLabel should be correctly set', () => {
                expect(decorated.get('metricAxisLabel')).to.equal('Sum of Cart Additions (Account ID: element 1, element 3)');
            });

            it('metrciAxisLabel should be cropped to 255 characters', () => {
                item = item.set('attribute', 'aaeFKXFYiCc0_long');
                decorated = createDecoratedBucketItem(item);

                item = item.setIn(['filters', 0, 'selectedElements'], fromJS(range(1, 50).map(idx => elements.get(idx))));
                decorated = createDecoratedBucketItem(item);

                expect(decorated.get('metricAxisLabel').length).to.equal(255);
            });
        });
    });
});

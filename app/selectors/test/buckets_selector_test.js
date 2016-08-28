import { fromJS } from 'immutable';
import { bucketsSelector, getItem, getItemPath, getCategoryPath, getMeasurePath, getItemBucket } from '../buckets_selector';
import initialState from '../../reducers/initial_state';
import * as Paths from '../../constants/StatePaths';
import { bucketItem } from '../../models/bucket_item';
import { INITIAL_MODEL } from '../../models/bucket';
import { METRICS, CATEGORIES } from '../../constants/bucket';

describe('Buckets selector test', () => {
    let state;

    beforeEach(() => {
        state = initialState
            .setIn(Paths.PROJECT_ID, 'my project')
            .mergeIn(Paths.DATA, fromJS({
                itemCache: {
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
                },
                catalogue: {
                    items: ['fact.spend_analysis.cart_additions', 'aaeFKXFYiCc0']
                },
                visualizationType: 'bar',
                buckets: INITIAL_MODEL
                    .mergeIn([METRICS], fromJS({
                        items: [{
                            collapsed: true,
                            attribute: 'fact.spend_analysis.cart_additions',
                            filters: []
                        }, {
                            collapsed: true,
                            attribute: 'aaeFKXFYiCc0',
                            filters: []
                        }]
                    }))
                    .mergeIn([CATEGORIES], fromJS({
                        items: [{
                            collapsed: true,
                            attribute: 'fact.spend_analysis.cart_additions',
                            filters: []
                        }]
                    }))
            }));
    });

    it('returns visualization type', () => {
        let { visualizationType } = bucketsSelector(state);
        expect(visualizationType).to.equal('bar');
    });

    it('returns decorated buckets', () => {
        let { buckets } = bucketsSelector(state);

        expect(buckets.get('original')).to.equal(state.getIn(Paths.BUCKETS));

        buckets.delete('original').forEach(bucket => {
            bucket.get('items').forEach(item => {
                expect(item.get('isMetric')).to.equal(bucket.get('keyName') === METRICS);
            });
        });
    });

    describe('getItemPath', () => {
        beforeEach(() => {
            state = initialState
                .setIn([...Paths.BUCKETS, METRICS, 'items'], fromJS([bucketItem({}), bucketItem({})]))
                .setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([bucketItem({}), bucketItem({})]));
        });

        it('should get path in category', () => {
            const path = getItemPath(state, 1);

            expect(path).to.eql(['data', 'buckets', 'categories', 'items', 1]);
        });

        it('should get path in metrics', () => {
            const path = getItemPath(state, 3);

            expect(path).to.eql(['data', 'buckets', 'metrics', 'items', 1]);
        });

        it('should get path in metrics with PoP item', () => {
            state = state.setIn([...Paths.BUCKETS, METRICS, 'items', 1, 'showPoP'], true);
            const path = getItemPath(state, 4);

            expect(path).to.eql(['data', 'buckets', 'metrics', 'items', 1]);
        });
    });

    describe('getItem', () => {
        beforeEach(() => {
            state = initialState
                .setIn([...Paths.BUCKETS, METRICS, 'items'], fromJS([bucketItem({}), bucketItem({})]))
                .setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([bucketItem({}), bucketItem({})]));
        });

        it('should get item in category', () => {
            const item = getItem(state, 1);

            expect(item).to.eql(state.getIn(['data', 'buckets', 'categories', 'items', 1]));
        });

        it('should get item in metrics', () => {
            const item = getItem(state, 3);

            expect(item).to.eql(state.getIn(['data', 'buckets', 'metrics', 'items', 1]));
        });

        it('should get item in metrics wit PoP item', () => {
            state = state.setIn([...Paths.BUCKETS, METRICS, 'items', 1, 'showPoP'], true);
            const item = getItem(state, 4);

            expect(item).to.eql(state.getIn(['data', 'buckets', 'metrics', 'items', 1]));
        });
    });

    describe('getItemBucket', () => {
        beforeEach(() => {
            state = initialState
                .setIn([...Paths.BUCKETS, METRICS, 'items'], fromJS([bucketItem({}), bucketItem({})]))
                .setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([bucketItem({}), bucketItem({})]));
        });

        it('should get bucket in category', () => {
            const bucket = getItemBucket(state, 1);

            expect(bucket).to.eql(CATEGORIES);
        });

        it('should get bucket in metrics', () => {
            const bucket = getItemBucket(state, 3);

            expect(bucket).to.eql(METRICS);
        });

        it('should get bucket in metrics wit PoP bucket', () => {
            state = state.setIn([...Paths.BUCKETS, METRICS, 'items', 1, 'showPoP'], true);
            const bucket = getItemBucket(state, 4);

            expect(bucket).to.eql(METRICS);
        });
    });

    describe('getCategoryPath', () => {
        it('should get path in category', () => {
            const path = getCategoryPath(state, 0);
            expect(path).to.eql(['data', 'buckets', 'categories', 'items', 0]);
        });
    });

    describe('getMeasurePath', () => {
        it('should get path in measure', () => {
            const path = getMeasurePath(state, 1);
            expect(path).to.eql(['data', 'buckets', 'metrics', 'items', 1]);
        });
    });
});

import bucketsReducer from '../buckets_reducer';
import bucketFiltersReducer from '../bucket_filters_reducer';

import { bucketsSelector } from '../../selectors/buckets_selector';
import { bucketItem } from '../../models/bucket_item';
import { DATE_DATASET_ATTRIBUTE } from '../../models/date_item';

import * as ActionTypes from '../../constants/Actions';
import * as Paths from '../../constants/StatePaths';
import { METRICS, CATEGORIES, FILTERS, STACKS } from '../../constants/bucket';
import { BUCKET_ITEM } from '../../constants/DragItemTypes';

import * as Actions from '../../actions/dnd_actions';
import * as FilterActions from '../../actions/buckets_actions';
import initialState from '../initial_state';

import { Map } from 'immutable';


describe('buckets_reducer', () => {
    let state;

    function reduce(action) {
        if (typeof action === 'function') {
            // thunk
            action(
                a => {
                    state = bucketsReducer(state, a);
                },
                () => state
            );
        } else {
            state = bucketsReducer(state, action);
        }
    }

    function createCatalogueItem(id, type = 'fact') {
        const item = Map({ id, type, identifier: id });

        state = state
            .setIn(Paths.CATALOGUE_ITEMS, state.getIn(Paths.CATALOGUE_ITEMS).push(item))
            .setIn([...Paths.ITEM_CACHE, id], item);

        return item;
    }

    function bucketsAddItem(keyName, attribute, type) {
        let item = bucketItem({ attribute }),
            kp = [...Paths.BUCKETS, keyName, 'items'];

        createCatalogueItem(attribute, type);
        state = state.setIn(kp, state.getIn(kp).push(item));

        return item;
    }

    function getBucketAttributes(bucketIdx) {
        return state
            .getIn([...Paths.BUCKETS, bucketIdx, 'items'])
            .map(item => item.get('attribute'))
            .toArray();
    }

    beforeEach(() => {
        state = initialState;
    });

    describe(`#${ActionTypes.BUCKETS_DND_ITEM_INSERT}`, () => {
        it('should put bucket item with attribute sample_catalogue_item to first bucket', () => {
            const CATALOGUE_ITEM_ID = 'sample_catalogue_item';
            const catalogueItem = createCatalogueItem(CATALOGUE_ITEM_ID);

            const action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: METRICS,
                    catalogueItem
                }
            };

            reduce(action);

            expect(getBucketAttributes(METRICS)).to.eql([CATALOGUE_ITEM_ID]);
        });

        it('should add bucket item to the end of items of first bucket', () => {
            bucketsAddItem(METRICS, 'sample_catalogue_item');
            const CATALOGUE_ITEM_ID = 'second';
            const catalogueItem = createCatalogueItem(CATALOGUE_ITEM_ID);

            const action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: METRICS,
                    catalogueItem
                }
            };

            reduce(action);

            expect(getBucketAttributes(METRICS)).to.eql(['sample_catalogue_item', CATALOGUE_ITEM_ID]);
        });

        it(`should create filter when adding a ${CATEGORIES} or ${STACKS} bucket`, () => {
            const CATEGORIES_BUCKET_ITEM_ID = 'sample_categories_bucket_item';
            const STACKS_BUCKET_ITEM_ID = 'sample_stacks_bucket_item';
            let catalogueItem = createCatalogueItem(CATEGORIES_BUCKET_ITEM_ID, 'attribute');
            let action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: CATEGORIES,
                    catalogueItem
                }
            };
            reduce(action);
            expect(state.getIn([...Paths.BUCKETS_FILTERS_ITEMS, 0, 'attribute']))
                .to.eql(CATEGORIES_BUCKET_ITEM_ID);

            catalogueItem = createCatalogueItem(STACKS_BUCKET_ITEM_ID, 'attribute');
            action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: STACKS,
                    catalogueItem
                }
            };
            reduce(action);
            expect(getBucketAttributes(FILTERS)).to.eql([CATEGORIES_BUCKET_ITEM_ID, STACKS_BUCKET_ITEM_ID]);
        });

        it('should add an "auto" flag to a filter created when adding a category or stack item', () => {
            const CATEGORIES_BUCKET_ITEM_ID = 'dummy_categories_bucket_item';
            const catalogueItem = createCatalogueItem(CATEGORIES_BUCKET_ITEM_ID, 'attribute');
            const action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: CATEGORIES,
                    catalogueItem
                }
            };

            reduce(action);
            expect(state.getIn([
                ...Paths.BUCKETS_FILTERS_ITEMS, 0, 'isAutoCreated'
            ])).to.equal(true);
        });

        it('should not add bucket item if already exists on buckets list', () => {
            const CATALOGUE_ITEM_ID = 'dummy_catalogue_item';
            bucketsAddItem(FILTERS, CATALOGUE_ITEM_ID);
            const catalogueItem = createCatalogueItem(CATALOGUE_ITEM_ID, 'attribute');
            const action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: CATEGORIES,
                    catalogueItem
                }
            };
            reduce(action);
            expect(getBucketAttributes(FILTERS)).to.eql(['dummy_catalogue_item']);
        });

        it('should result in valid bucket item in terms of bucketsSelector', () => {
            const CATALOGUE_ITEM_ID = 'sample_catalogue_item';
            const catalogueItem = createCatalogueItem(CATALOGUE_ITEM_ID);

            const action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: METRICS,
                    catalogueItem
                }
            };

            reduce(action);
            const res = bucketsSelector(state);

            expect(res.buckets.getIn([METRICS, 'items', 0, 'attribute'])).to.eql(catalogueItem);
        });

        it('should put item into bucket by keyName', () => {
            const CATALOGUE_ITEM_ID = 'sample_catalogue_item';
            const catalogueItem = createCatalogueItem(CATALOGUE_ITEM_ID, 'attribute');

            const action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: CATEGORIES,
                    catalogueItem
                }
            };

            reduce(action);

            expect(getBucketAttributes(CATEGORIES)).to.eql([CATALOGUE_ITEM_ID]);
        });

        it('should put attribute date dataset in case of date dropped', () => {
            const catalogueItem = createCatalogueItem(DATE_DATASET_ATTRIBUTE, 'date');

            const action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: CATEGORIES,
                    catalogueItem
                }
            };

            reduce(action);

            expect(getBucketAttributes(CATEGORIES)).to.eql([DATE_DATASET_ATTRIBUTE]);
        });
    });

    describe(`#${ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_FILTER}`, () => {
        it('should put bucket item with attribute sample_catalogue_item to filter bucket', () => {
            const CATALOGUE_ITEM_ID = 'sample_catalogue_item';
            const catalogueItem = createCatalogueItem(CATALOGUE_ITEM_ID, 'attribute');

            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_FILTER,
                payload: {
                    keyName: 'filters',
                    catalogueItem
                }
            };

            reduce(action);

            expect(getBucketAttributes(FILTERS)).to.eql([CATALOGUE_ITEM_ID]);
        });

        it('should add bucket item to the end of items of filter bucket', () => {
            bucketsAddItem(FILTERS, 'sample_catalogue_item');
            const CATALOGUE_ITEM_ID = 'second';
            const catalogueItem = createCatalogueItem(CATALOGUE_ITEM_ID, 'attribute');

            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_FILTER,
                payload: {
                    keyName: 'filters',
                    catalogueItem
                }
            };

            reduce(action);

            expect(getBucketAttributes(FILTERS)).to.eql(['sample_catalogue_item', CATALOGUE_ITEM_ID]);
        });

        it('should result in valid bucket item in terms of bucketsSelector', () => {
            const CATALOGUE_ITEM_ID = 'sample_catalogue_item';
            const catalogueItem = createCatalogueItem(CATALOGUE_ITEM_ID, 'attribute');

            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_FILTER,
                payload: {
                    keyName: 'filters',
                    catalogueItem
                }
            };

            reduce(action);
            const res = bucketsSelector(state);

            expect(res.buckets.getIn([FILTERS, 'items', 0, 'attribute'])).to.eql(catalogueItem);
        });

        it('should put attribute date dataset in case of date dropped', () => {
            const catalogueItem = createCatalogueItem(DATE_DATASET_ATTRIBUTE, 'date');

            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_FILTER,
                payload: {
                    keyName: 'filters',
                    catalogueItem
                }
            };

            reduce(action);

            expect(getBucketAttributes(FILTERS)).to.eql([DATE_DATASET_ATTRIBUTE]);
        });
    });

    describe(`#${ActionTypes.BUCKETS_DND_ITEM_REMOVE}`, () => {
        it('should remove item from first bucket', () => {
            const BUCKET_ID = METRICS;
            const item = bucketsAddItem(BUCKET_ID, 'sample_catalogue_item');

            const action = Actions.removeBucketItem({
                bucketItem: item
            });

            reduce(action);

            expect(state.getIn([...Paths.BUCKETS, BUCKET_ID, 'items']).size).to.equal(0);
        });

        it('should remove item from second bucket', () => {
            const BUCKET_ID = CATEGORIES;
            bucketsAddItem(METRICS, 'sample_catalogue_item');
            const item = bucketsAddItem(BUCKET_ID, 'sample_catalogue_item');

            const action = Actions.removeBucketItem({
                bucketItem: item
            });

            reduce(action);

            expect(state.getIn([...Paths.BUCKETS, METRICS, 'items']).size).to.equal(1);
            expect(state.getIn([...Paths.BUCKETS, BUCKET_ID, 'items']).size).to.equal(0);
        });

        it('should remove first item from bucket', () => {
            const BUCKET_ID = METRICS;
            const firstItem = bucketsAddItem(BUCKET_ID, 'sample_catalogue_item');
            const secondItem = bucketsAddItem(BUCKET_ID, 'other');

            const action = Actions.removeBucketItem({
                bucketItem: firstItem
            });

            reduce(action);


            expect(state.getIn([...Paths.BUCKETS, BUCKET_ID, 'items', 0])).to.equal(secondItem);
        });

        it('should remove first item from second bucket', () => {
            const FIRST_BUCKET_ID = METRICS;
            const SECOND_BUCKET_ID = CATEGORIES;

            bucketsAddItem(FIRST_BUCKET_ID, 'sample_catalogue_item');
            const firstItem = bucketsAddItem(SECOND_BUCKET_ID, 'sample_catalogue_item');
            const secondItem = bucketsAddItem(SECOND_BUCKET_ID, 'other');

            const action = Actions.removeBucketItem({
                bucketItem: firstItem
            });

            reduce(action);

            expect(state.getIn([...Paths.BUCKETS, FIRST_BUCKET_ID, 'items']).size).to.equal(1);
            expect(state.getIn([...Paths.BUCKETS, SECOND_BUCKET_ID, 'items']).size).to.equal(1);

            expect(state.getIn([...Paths.BUCKETS, SECOND_BUCKET_ID, 'items', 0])).to.equal(secondItem);
        });

        it('should remove date from bucket', () => {
            const BUCKET_ID = METRICS;
            const firstItem = bucketsAddItem(BUCKET_ID, DATE_DATASET_ATTRIBUTE, 'date');
            const secondItem = bucketsAddItem(BUCKET_ID, 'other');

            const action = Actions.removeBucketItem({
                bucketItem: firstItem
            });

            reduce(action);

            expect(state.getIn([...Paths.BUCKETS, BUCKET_ID, 'items', 0])).to.equal(secondItem);
        });

        it('should clear selected date if date was removed from bucket', () => {
            state = state.setIn(Paths.DATE_DATASETS_SELECTED, { attribute: 'dataset-id' });

            const dateItem = bucketsAddItem(CATEGORIES, DATE_DATASET_ATTRIBUTE, 'date');

            const action = Actions.removeBucketItem({
                from: CATEGORIES,
                bucketItem: dateItem
            });

            reduce(action);

            expect(state.getIn(Paths.DATE_DATASETS_SELECTED)).to.equal(null);
        });

        it('should remove related filter if was not edited', () => {
            const BUCKET_ITEM_CATEGORY_ID = CATEGORIES;
            const categoryItem = createCatalogueItem(BUCKET_ITEM_CATEGORY_ID, 'attribute');
            let action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: CATEGORIES,
                    catalogueItem: categoryItem
                }
            };

            reduce(action);

            let filters = state.getIn(Paths.BUCKETS_FILTERS_ITEMS);
            expect(filters.size).to.equal(1);

            action = {
                type: ActionTypes.BUCKETS_DND_ITEM_REMOVE,
                payload: {
                    type: BUCKET_ITEM,
                    from: CATEGORIES,
                    dragged: 'attribute',
                    bucketItem: state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0])
                }
            };

            reduce(action);

            filters = state.getIn(Paths.BUCKETS_FILTERS_ITEMS);
            expect(filters.size).to.equal(0);
        });

        it('should not remove related filter if was edited', () => {
            const BUCKET_ITEM_CATEGORY_ID = CATEGORIES;
            const categoryItem = createCatalogueItem(BUCKET_ITEM_CATEGORY_ID, 'attribute');
            let action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: CATEGORIES,
                    catalogueItem: categoryItem
                }
            };

            reduce(action);

            let filters = state.getIn(Paths.BUCKETS_FILTERS_ITEMS);
            expect(filters.size).to.equal(1);

            action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
                payload: {
                    item: filters.getIn(['0']),
                    filter: filters.getIn(['0', 'filters', '0']),
                    changes: {
                        allElements: ['dummy_url_one', 'dummy_url_two'],
                        selectedElements: ['dummy_url_one']
                    }
                }
            };

            state = bucketFiltersReducer(state, action);

            action = {
                type: ActionTypes.BUCKETS_DND_ITEM_REMOVE,
                payload: {
                    type: BUCKET_ITEM,
                    from: CATEGORIES,
                    dragged: 'attribute',
                    bucketItem: state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0])
                }
            };

            reduce(action);

            filters = state.getIn(Paths.BUCKETS_FILTERS_ITEMS);
            expect(filters.size).to.equal(1);
        });

        it('should not remove manually added filter when bucket item from same catalog item is removed', () => {
            const CATALOGUE_ITEM_ID = 'sample_catalogue_item';
            const catalogueItem = createCatalogueItem(CATALOGUE_ITEM_ID, 'attribute');

            let action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_FILTER,
                payload: {
                    keyName: 'filters',
                    catalogueItem
                }
            };

            reduce(action);

            action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: CATEGORIES,
                    catalogueItem
                }
            };

            reduce(action);
            let filters = state.getIn([...Paths.BUCKETS_FILTERS_ITEMS]);
            expect(filters.size).to.equal(1);

            action = {
                type: ActionTypes.BUCKETS_DND_ITEM_REMOVE,
                payload: {
                    from: CATEGORIES,
                    dragged: 'attribute',
                    type: BUCKET_ITEM,
                    bucketItem: state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0])
                }
            };

            expect(filters.size).to.equal(1);
            expect(filters.getIn([0, 'isAutoCreated'])).not.to.equal(true);
            expect(filters.getIn([0, 'attribute'])).to.equal(CATALOGUE_ITEM_ID);
        });
    });

    describe(`#${ActionTypes.BUCKETS_SET_BUCKET_ITEM_REMOVE_FILTER}`, () => {
        it('should remove item from filter bucket', () => {
            const BUCKET_ID = FILTERS;
            const item = bucketsAddItem(BUCKET_ID, 'sample_catalogue_item');

            const action = FilterActions.setBucketItemRemoveFilter({
                bucketItem: item,
                from: FILTERS
            });

            reduce(action);

            expect(state.getIn([...Paths.BUCKETS, BUCKET_ID, 'items']).size).to.equal(0);
        });

        it('should remove filter item from bucket', () => {
            const BUCKET_ID = FILTERS;
            const firstItem = bucketsAddItem(BUCKET_ID, 'sample_catalogue_item');
            const secondItem = bucketsAddItem(BUCKET_ID, 'other');

            const action = FilterActions.setBucketItemRemoveFilter({
                bucketItem: firstItem,
                from: FILTERS
            });

            reduce(action);

            expect(state.getIn([...Paths.BUCKETS, BUCKET_ID, 'items', 0])).to.equal(secondItem);
        });

        it('should remove date from bucket', () => {
            const BUCKET_ID = FILTERS;
            const firstItem = bucketsAddItem(BUCKET_ID, DATE_DATASET_ATTRIBUTE, 'date');
            const secondItem = bucketsAddItem(BUCKET_ID, 'other');

            const action = FilterActions.setBucketItemRemoveFilter({
                bucketItem: firstItem,
                from: FILTERS
            });

            reduce(action);

            expect(state.getIn([...Paths.BUCKETS, BUCKET_ID, 'items', 0])).to.equal(secondItem);
        });
    });

    describe(`#${ActionTypes.BUCKETS_DND_ITEM_REPLACE}`, () => {
        it('should replace item', () => {
            const BUCKET_ID = METRICS;

            const catalogueItem = createCatalogueItem('sample_catalogue_item', 'attribute');
            const item = bucketsAddItem(BUCKET_ID, 'other_item');

            const action = Actions.replaceBucketItem({
                bucketItem: item,
                catalogueItem
            });

            reduce(action);

            expect(getBucketAttributes(BUCKET_ID)).to.eql(['sample_catalogue_item']);
        });

        it('should replace first item', () => {
            const BUCKET_ID = METRICS;

            const catalogueItem = createCatalogueItem('sample_catalogue_item');
            const item = bucketsAddItem(BUCKET_ID, 'other_item');
            bucketsAddItem(BUCKET_ID, 'second_item');

            const action = Actions.replaceBucketItem({
                bucketItem: item,
                catalogueItem
            });

            reduce(action);

            expect(getBucketAttributes(BUCKET_ID)).to.eql(['sample_catalogue_item', 'second_item']);
        });

        it('should replace second item', () => {
            const BUCKET_ID = METRICS;

            const catalogueItem = createCatalogueItem('sample_catalogue_item');
            bucketsAddItem(BUCKET_ID, 'other_item');
            const item = bucketsAddItem(BUCKET_ID, 'second_item');

            const action = Actions.replaceBucketItem({
                bucketItem: item,
                catalogueItem
            });

            reduce(action);

            expect(getBucketAttributes(BUCKET_ID)).to.eql(['other_item', 'sample_catalogue_item']);

            expect(state.getIn([...Paths.BUCKETS, BUCKET_ID, 'items', 1, 'attribute']))
                .to.equal('sample_catalogue_item');
        });

        it('should replace unedited filter', () => {
            const catalogueItem = createCatalogueItem('sample_catalogue_item', 'attribute');
            const secondItem = createCatalogueItem('another_item', 'attribute');
            let action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: CATEGORIES,
                    catalogueItem
                }
            };

            reduce(action);

            let filters = state.getIn(Paths.BUCKETS_FILTERS_ITEMS);
            expect(filters.size).to.equal(1);

            action = {
                type: ActionTypes.BUCKETS_DND_ITEM_REPLACE,
                payload: {
                    bucketItem: state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0]),
                    catalogueItem: secondItem
                }
            };

            reduce(action);
            filters = state.getIn(Paths.BUCKETS_FILTERS_ITEMS);

            expect(filters.size).to.equal(1);
            expect(filters.getIn(['0', 'attribute'])).to.equal('another_item');
        });

        it('should not replace unedited filter', () => {
            const catalogueItem = createCatalogueItem('sample_catalogue_item', 'attribute');
            const secondItem = createCatalogueItem('another_item', 'attribute');
            let action = {
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: CATEGORIES,
                    catalogueItem
                }
            };

            reduce(action);

            let filters = state.getIn(Paths.BUCKETS_FILTERS_ITEMS);
            expect(filters.size).to.equal(1);

            action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
                payload: {
                    item: filters.getIn(['0']),
                    filter: filters.getIn(['0', 'filters', '0']),
                    changes: {
                        allElements: ['dummy_url_one', 'dummy_url_two'],
                        selectedElements: ['dummy_url_one']
                    }
                }
            };

            state = bucketFiltersReducer(state, action);

            action = {
                type: ActionTypes.BUCKETS_DND_ITEM_REPLACE,
                payload: {
                    bucketItem: state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0]),
                    catalogueItem: secondItem
                }
            };

            reduce(action);
            filters = state.getIn(Paths.BUCKETS_FILTERS_ITEMS);

            expect(filters.size).to.equal(2);
            expect(filters.getIn(['1', 'attribute'])).to.equal('another_item');
        });

        it('should replace date in bucket', () => {
            const BUCKET_ID = METRICS;

            const catalogueItem = createCatalogueItem('sample_catalogue_item');
            const item = bucketsAddItem(BUCKET_ID, DATE_DATASET_ATTRIBUTE, 'date');

            const action = Actions.replaceBucketItem({
                bucketItem: item,
                catalogueItem
            });

            reduce(action);

            expect(getBucketAttributes(BUCKET_ID)).to.eql(['sample_catalogue_item']);
        });
    });

    describe(`#${ActionTypes.BUCKETS_DND_ITEM_SWAP}`, () => {
        it('should take item from bucket[0] and put it to bucket[1]', () => {
            const item = bucketsAddItem(METRICS, 'sample', 'attribute');

            const action = Actions.swapBucketItem({
                from: item,
                keyName: state.getIn([...Paths.BUCKETS, CATEGORIES, 'keyName']),
                original: {
                    from: CATEGORIES,
                    to: STACKS,
                    dragged: 'attribute'
                }
            });
            reduce(action);

            expect(state.getIn([...Paths.BUCKETS, METRICS, 'items']).size).to.equal(0);
            expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items']).size).to.equal(1);
            expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0])).to.equal(item);
        });

        it('should take item from bucket[0] and swap with item in bucket[1]', () => {
            const from = bucketsAddItem(METRICS, 'from');
            const to = bucketsAddItem(CATEGORIES, 'to');

            const action = Actions.swapBucketItem({
                from,
                to,
                original: {
                    from: CATEGORIES,
                    to: STACKS,
                    dragged: 'attribute'
                }
            });
            reduce(action);

            expect(state.getIn([...Paths.BUCKETS, METRICS, 'items', 0])).to.equal(to);
            expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0])).to.equal(from);
        });

        it('should take item from bucket[2] and swap with item in bucket[1][date]', () => {
            const from = bucketsAddItem(FILTERS, 'from');
            const date = bucketsAddItem(CATEGORIES, DATE_DATASET_ATTRIBUTE, 'date');
            const action = Actions.swapBucketItem({
                from,
                to: date,
                original: {
                    from: CATEGORIES,
                    to: STACKS,
                    dragged: 'attribute'
                }
            });
            reduce(action);

            expect(state.getIn([...Paths.BUCKETS, FILTERS, 'items', 0])).to.equal(undefined);
            expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0])).to.equal(from);
        });
    });
});

import { Map, fromJS } from 'immutable';

import * as ActionTypes from '../../constants/Actions';
import * as Paths from '../../constants/StatePaths';
import { METRICS } from '../../constants/bucket';
import { ALL_TIME, MONTH } from '../../constants/presets';

import bucketFiltersReducer from '../bucket_filters_reducer';
import { filterBucketItem } from '../buckets_reducer';
import { DATE_DATASET_ATTRIBUTE } from '../../models/date_item';
import { bucketItem } from '../../models/bucket_item';

import initialState from '../initial_state';


describe('Bucket Filters Reducer', () => {
    const CATALOGUE_ITEM_ID = 'sample_catalogue_item';
    const ATTRIBUTE_ID = 'filter_attribute';
    const attribute = fromJS({ id: ATTRIBUTE_ID });

    let state, item;

    function reduce(action) {
        state = bucketFiltersReducer(state, action);
    }

    function createCatalogueItem(id, type = 'fact') {
        const catalogueItem = Map({ id, type, identifier: id });

        state = state
            .setIn(Paths.CATALOGUE_ITEMS, state.getIn(Paths.CATALOGUE_ITEMS).push(catalogueItem))
            .setIn([...Paths.ITEM_CACHE, id], catalogueItem);

        return catalogueItem;
    }

    function bucketsAddItem(keyName, catalogueItem, type) {
        let _item = bucketItem({ attribute: catalogueItem }),
            kp = [...Paths.BUCKETS, keyName, 'items'];

        createCatalogueItem(attribute, type);
        state = state.setIn(kp, state.getIn(kp).push(_item));

        return _item;
    }

    function getItem(bucket, idx) {
        return state.getIn([...Paths.BUCKETS, bucket, 'items', idx]);
    }

    beforeEach(() => {
        state = initialState;
        item = bucketsAddItem(METRICS, CATALOGUE_ITEM_ID);
    });

    describe(`#${ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTER}`, () => {
        beforeEach(() => {
            reduce({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTER,
                payload: {
                    keyName: METRICS,
                    item,
                    attribute
                }
            });
        });

        it('should add filter to bucket item', () => {
            const filters = getItem(METRICS, 0).get('filters');
            expect(filters.size).to.equal(1);
            expect(filters.getIn([0, 'attribute'])).to.equal(ATTRIBUTE_ID);
        });

        it('should add attribute to the item cache', () => {
            expect(state.getIn([...Paths.ITEM_CACHE, ATTRIBUTE_ID])).to.be.ok();
        });
    });

    describe(`#${ActionTypes.BUCKETS_SET_BUCKET_ITEM_REMOVE_METRIC_FILTER}`, () => {
        it('should remove filter from bucket item', () => {
            reduce({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTER,
                payload: {
                    keyName: METRICS,
                    item,
                    attribute
                }
            });
            item = getItem(METRICS, 0);

            reduce({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_REMOVE_METRIC_FILTER,
                payload: {
                    keyName: METRICS,
                    item,
                    filter: item.getIn(['filters', 0])
                }
            });

            const filters = getItem(METRICS, 0).get('filters');
            expect(filters.size).to.equal(0);
        });
    });

    describe(`#${ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER}`, () => {
        beforeEach(() => {
            reduce({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTER,
                payload: {
                    keyName: METRICS,
                    item,
                    attribute
                }
            });
            item = getItem(METRICS, 0);
        });

        it('should update filter of bucket item', () => {
            reduce({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
                payload: {
                    keyName: METRICS,
                    item,
                    filter: item.getIn(['filters', 0]),
                    changes: {
                        isInverted: false,
                        totalElementsCount: 3
                    }
                }
            });

            const filter = getItem(METRICS, 0).getIn(['filters', 0]);
            expect(filter.get('isInverted')).to.equal(false);
            expect(filter.get('totalElementsCount')).to.equal(3);
        });

        it('should update global date dataset setting if specified', () => {
            const DATE_DATASET_ID = 'date_dataset_id';
            reduce({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
                payload: {
                    keyName: METRICS,
                    item,
                    filter: item.getIn(['filters', 0]),
                    changes: {
                        dateDataSet: fromJS({ identifier: DATE_DATASET_ID })
                    }
                }
            });

            const filter = getItem(METRICS, 0).getIn(['filters', 0]);
            expect(filter.get('dateDataSet')).to.equal(undefined);

            const dateDataSet = state.getIn(Paths.DATE_DATASETS_SELECTED_ID);
            expect(dateDataSet).to.equal(DATE_DATASET_ID);
        });

        it('should leave global date dataset setting unchanged if not specified', () => {
            const DATE_DATASET_ID = 'date_dataset_id';
            state = state.setIn(Paths.DATE_DATASETS_SELECTED, fromJS({ identifier: DATE_DATASET_ID }));

            reduce({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
                payload: {
                    keyName: METRICS,
                    item,
                    filter: item.getIn(['filters', 0]),
                    changes: {
                        isInverted: false
                    }
                }
            });

            const dateDataSet = state.getIn(Paths.DATE_DATASETS_SELECTED_ID);
            expect(dateDataSet).to.equal(DATE_DATASET_ID);
        });

        it('should set isModified flag to true', () => {
            reduce({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
                payload: {
                    keyName: METRICS,
                    item,
                    filter: item.getIn(['filters', 0]),
                    changes: {
                        isInverted: false,
                        totalElementsCount: 3
                    }
                }
            });

            let filter = getItem(METRICS, 0).getIn(['filters', 0]);
            expect(filter.get('isModified')).to.equal(true);
        });

        it('should not set isModified flag to true on automatic update', () => {
            reduce({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
                payload: {
                    keyName: METRICS,
                    item,
                    filter: item.getIn(['filters', 0]),
                    changes: {
                        isInverted: false,
                        totalElementsCount: 3
                    }
                },
                meta: {
                    isAutoModified: true
                }
            });

            let filter = getItem(METRICS, 0).getIn(['filters', 0]);
            expect(filter.get('isModified')).to.equal(false);
        });

        it('should honor isModified flag on automatic update', () => {
            item = item.setIn(['filters', 0, 'isModified'], true);
            state = state.setIn([...Paths.BUCKETS, METRICS, 'items', 0], item);

            reduce({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
                payload: {
                    keyName: METRICS,
                    item,
                    filter: item.getIn(['filters', 0]),
                    changes: {
                        isInverted: false,
                        totalElementsCount: 3
                    }
                },
                meta: {
                    isAutoModified: true
                }
            });

            let filter = getItem(METRICS, 0).getIn(['filters', 0]);
            expect(filter.get('isModified')).to.equal(true);
        });
    });

    describe(`#${ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER}`, () => {
        it('should remove PoP from bucketItems, when dateFilter is set to \'all\'', () => {
            const filterItem = filterBucketItem({
                attribute: DATE_DATASET_ATTRIBUTE,
                interval: MONTH,
                isAutoCreated: false
            });
            state = state.setIn([...Paths.BUCKETS_METRICS_ITEMS, 0, 'showPoP'], true)
                .updateIn([...Paths.BUCKETS_FILTERS_ITEMS], items => items.push(filterItem));

            reduce({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER,
                payload: {
                    item: filterItem,
                    filter: filterItem.getIn(['filters', 0]),
                    changes: {
                        interval: {
                            name: ALL_TIME
                        }
                    }
                }
            });
            expect(getItem(METRICS, 0).get('showPoP')).to.eql(false);
        });
    });
});

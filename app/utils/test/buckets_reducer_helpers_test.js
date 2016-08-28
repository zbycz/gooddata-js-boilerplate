import { fromJS } from 'immutable';

import * as Actions from '../../constants/Actions';
import * as bucketsHelpers from '../buckets_reducer_helpers'; // eslint-disable-line
import { __RewireAPI__ } from '../buckets_reducer_helpers'; // eslint-disable-line
import initialState from '../../reducers/initial_state';
import { bucketItem } from '../../models/bucket_item';
import * as Paths from '../../constants/StatePaths';
import { METRICS, CATEGORIES } from '../../constants/bucket';
import { DATE_DATASET_ATTRIBUTE } from '../../models/date_item';

describe('Buckets Reducer Helpers tests', () => {
    let bucketsReducer, bucketsFilterReducer;
    let state;

    beforeEach(() => {
        state = initialState;
        bucketsReducer = sinon.stub();
        bucketsFilterReducer = sinon.stub();

        __RewireAPI__.__Rewire__('bucketsReducer', bucketsReducer);
        __RewireAPI__.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);
    });

    afterEach(() => {
        __RewireAPI__.__ResetDependency__('bucketsReducer');
        __RewireAPI__.__ResetDependency__('bucketsFilterReducer');
    });

    describe('addItem', () => {
        it('should add item into Metrics', () => {
            const item = bucketItem({});

            bucketsHelpers.addItem(state, METRICS, item);

            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
            expect(args.payload.keyName).to.eql(METRICS);
        });
    });

    describe('setVisualizationType', () => {
        it('should set visualization type', () => {
            const type = 'test type';

            bucketsHelpers.setVisualizationType(state, type);

            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE);
            expect(args.payload).to.eql(type);
        });
    });

    describe('findDate', () => {
        it('should not find date item in Metrics', () => {
            const date = bucketsHelpers.findDate(state, METRICS);

            expect(date).to.eql(undefined);
        });

        it('should find date item in Metrics', () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            state = state.setIn([...Paths.BUCKETS, METRICS, 'items'], fromJS([date]));
            const res = bucketsHelpers.findDate(state, METRICS);

            expect(res).to.be.ok();
            expect(res.toJS()).to.eql(date);
        });

        it('should find date item in Categories', () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            state = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([date]));
            const res = bucketsHelpers.findDate(state, CATEGORIES);

            expect(res).to.be.ok();
            expect(res.toJS()).to.eql(date);
        });

        it('should find date item in Categories with multiple item', () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            state = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([{}, {}, date, {}]));
            const res = bucketsHelpers.findDate(state, CATEGORIES);

            expect(res).to.be.ok();
            expect(res.toJS()).to.eql(date);
        });
    });

    describe('ensureDate', () => {
        it('should not add new date item', () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            state = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([{}, {}, date, {}]));

            bucketsHelpers.ensureDate(state, CATEGORIES);

            expect(bucketsReducer).not.to.be.called();
        });

        it('should add new date item', () => {
            bucketsHelpers.ensureDate(state, CATEGORIES);

            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
            expect(args.payload.keyName).to.eql(CATEGORIES);
        });
    });

    describe('setGranularity', () => {
        it('should find date item', () => {
            const granularity = 'test granularity';
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            state = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([{}, {}, date, {}]));

            bucketsHelpers.setGranularity(state, CATEGORIES, granularity);

            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY);
            expect(args.payload.item.toJS()).to.eql(date);
        });

        it('should pass granularity value', () => {
            const granularity = 'test granularity';
            bucketsHelpers.setGranularity(state, CATEGORIES, granularity);

            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY);
            expect(args.payload.value).to.eql(granularity);
        });
    });

    describe('updateItemFilter', () => {
        it('should not create new date item', () => {
            const filter = { test: 'value' };
            const date = { attribute: DATE_DATASET_ATTRIBUTE, filters: [filter] };
            const changes = { test: 'changes' };
            state = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([{}, {}, date, {}]));

            bucketsHelpers.updateItemFilter(state, CATEGORIES, changes);

            expect(bucketsFilterReducer).to.be.called();

            const args = bucketsFilterReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER);
            expect(args.payload.item.toJS()).to.eql(date);
            expect(args.payload.filter.toJS()).to.eql(filter);
            expect(args.payload.changes).to.eql(changes);
        });

        it('should create new date item', () => {
            const filter = { test: 'value' };
            const date = { attribute: DATE_DATASET_ATTRIBUTE, filters: [filter] };
            const changes = { test: 'changes' };
            const stateWithDate = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([{}, {}, date, {}]));

            bucketsReducer.onCall(0).returns(stateWithDate);

            bucketsHelpers.updateItemFilter(state, CATEGORIES, changes);

            expect(bucketsFilterReducer).to.be.called();

            const args = bucketsFilterReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER);
            expect(args.payload.item.toJS()).to.eql(date);
            expect(args.payload.filter.toJS()).to.eql(filter);
            expect(args.payload.changes).to.eql(changes);
        });
    });

    describe('setShowPoP', () => {
        it('should set shoPoP', () => {
            const item = bucketItem({});

            bucketsHelpers.setShowPoP(state, item, true);

            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_POP);
            expect(args.payload.item).to.eql(item);
            expect(args.payload.value).to.eql(true);
        });

        it('should clear shoPoP', () => {
            const item = bucketItem({});

            bucketsHelpers.setShowPoP(state, item, false);

            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_POP);
            expect(args.payload.item).to.eql(item);
            expect(args.payload.value).to.eql(false);
        });
    });

    describe('setShowInPercent', () => {
        it('should set showInPercent', () => {
            const item = bucketItem({});

            bucketsHelpers.setShowInPercent(state, item, true);

            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT);
            expect(args.payload.item).to.eql(item);
            expect(args.payload.value).to.eql(true);
        });

        it('should clear showInPercent', () => {
            const item = bucketItem({});

            bucketsHelpers.setShowInPercent(state, item, false);

            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT);
            expect(args.payload.item).to.eql(item);
            expect(args.payload.value).to.eql(false);
        });
    });
});

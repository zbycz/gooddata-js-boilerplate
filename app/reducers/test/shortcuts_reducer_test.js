import { fromJS } from 'immutable';

import * as Actions from '../../constants/Actions';
import shortcutsReducer from '../shortcuts_reducer';
import initialState from '../initial_state';
import { bucketItem } from '../../models/bucket_item';
import * as Paths from '../../constants/StatePaths';
import { METRICS, CATEGORIES, FILTERS } from '../../constants/bucket';
import { GRANULARITY } from '../../models/granularity';
import { DATE_DATASET_ATTRIBUTE } from '../../models/date_item';

describe('Shortcuts Reducer tests', () => {
    describe('date datasets', () => {
        describe('loaded flag', () => {
            it('should be false before load', () => {
                const action = {
                    type: Actions.SHORTCUT_DATE_DATASETS_UPDATE
                };
                const newState = shortcutsReducer(initialState, action);
                expect(newState.getIn(Paths.SHORTCUT_DATE_DATASETS_LOADED)).to.eql(false);
            });

            it('should be true after load', () => {
                const action = {
                    type: Actions.SHORTCUT_DATE_DATASETS_UPDATED
                };
                const newState = shortcutsReducer(initialState, action);
                expect(newState.getIn(Paths.SHORTCUT_DATE_DATASETS_LOADED)).to.eql(true);
            });
        });

        it('should set available date datasets', () => {
            const availableDateDataSet = fromJS([
                { foo: 'bar' }
            ]);
            const action = {
                type: Actions.SHORTCUT_DATE_DATASETS_UPDATED,
                payload: {
                    available: availableDateDataSet
                }
            };
            const newState = shortcutsReducer(initialState, action);
            expect(newState.getIn(Paths.SHORTCUT_DATE_DATASETS_AVAILABLE)).to.eql(availableDateDataSet);
        });
    });

    describe('Apply Attribute', () => {
        let helpers, bucketsReducer;
        const state = fromJS({ test: 'state' });
        const item = fromJS({ test: 'data' });

        beforeEach(() => {
            bucketsReducer = sinon.stub().returns(state);

            helpers = require('../../utils/buckets_reducer_helpers');
            helpers.__Rewire__('bucketsReducer', bucketsReducer);

            shortcutsReducer.__Rewire__('helpers', helpers);

            shortcutsReducer(state, {
                type: Actions.SHORTCUT_APPLY_ATTRIBUTE,
                payload: item
            });
        });

        afterEach(() => {
            shortcutsReducer.__ResetDependency__('helpers');
        });

        it('should add new item into Categories', () => {
            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
            expect(args.payload.keyName).to.eql(CATEGORIES);
        });

        it('should change visualisation type to Table', () => {
            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[1][1];

            expect(args.type).to.eql(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE);
            expect(args.payload).to.eql('table');
        });
    });

    describe('Apply Metric', () => {
        let helpers, bucketsReducer;
        const state = fromJS({ test: 'state' });
        const item = fromJS({ test: 'data' });

        beforeEach(() => {
            bucketsReducer = sinon.stub().returns(state);

            helpers = require('../../utils/buckets_reducer_helpers');
            helpers.__Rewire__('bucketsReducer', bucketsReducer);

            shortcutsReducer.__Rewire__('helpers', helpers);

            shortcutsReducer(state, {
                type: Actions.SHORTCUT_APPLY_METRIC,
                payload: item
            });
        });

        afterEach(() => {
            shortcutsReducer.__ResetDependency__('helpers');
        });

        it('should add new item into Metrics', () => {
            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
            expect(args.payload.keyName).to.eql(METRICS);
        });

        it('should change visualisation type to Column', () => {
            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[1][1];

            expect(args.type).to.eql(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE);
            expect(args.payload).to.eql('column');
        });
    });

    describe('Apply Metric Over Time', () => {
        let helpers, bucketsReducer, bucketsFilterReducer;

        describe('without loaded shortcut date datasets', () => {
            const state = initialState;
            const item = bucketItem({});

            beforeEach(() => {
                bucketsFilterReducer = sinon.stub().returns(state);
                bucketsReducer = sinon.stub().returns(state);

                helpers = require('../../utils/buckets_reducer_helpers');
                helpers.__Rewire__('bucketsReducer', bucketsReducer);
                helpers.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);

                shortcutsReducer.__Rewire__('helpers', helpers);

                shortcutsReducer(state, {
                    type: Actions.SHORTCUT_APPLY_METRIC_OVER_TIME,
                    payload: item
                });
            });

            afterEach(() => {
                shortcutsReducer.__ResetDependency__('helpers');
            });

            it('should not add category or filter', () => {
                expect(bucketsFilterReducer).not.to.be.called();
                expect(bucketsReducer).to.be.called();
            });
        });

        describe('without existing Date in Categories', () => {
            const state = initialState;
            const availableDateDataSets = fromJS([{ foo: 'bar' }]);
            const stateWithDateDataSets = state.setIn(Paths.SHORTCUT_DATE_DATASETS_AVAILABLE, availableDateDataSets);
            const filterItems = fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]);
            const stateWithFilter = state.setIn([...Paths.BUCKETS, FILTERS, 'items'], filterItems);
            const item = bucketItem({});

            beforeEach(() => {
                bucketsFilterReducer = sinon.stub().returns(stateWithFilter);
                bucketsReducer = sinon.stub();
                bucketsReducer.returns(stateWithFilter);

                helpers = require('../../utils/buckets_reducer_helpers');
                helpers.__Rewire__('bucketsReducer', bucketsReducer);
                helpers.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);

                shortcutsReducer.__Rewire__('helpers', helpers);

                shortcutsReducer(stateWithDateDataSets, {
                    type: Actions.SHORTCUT_APPLY_METRIC_OVER_TIME,
                    payload: item
                });
            });

            afterEach(() => {
                shortcutsReducer.__ResetDependency__('helpers');
            });

            it('should add new item into Metrics', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
                expect(args.payload.keyName).to.eql(METRICS);
            });

            it('should add new Date into Categories', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[1][1];

                expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
                expect(args.payload.keyName).to.eql(CATEGORIES);
            });

            it('should granularity to quarter', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[2][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY);
                expect(args.payload.value).to.eql(GRANULARITY.quarter);
            });

            it('should update filter with granularity', () => {
                expect(bucketsFilterReducer).to.be.called();

                const args = bucketsFilterReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER);
            });

            it('should change visualisation type to Column', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[3][1];

                expect(args.type).to.eql(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE);
                expect(args.payload).to.eql('column');
            });
        });

        describe('with existing Date in Categories', () => {
            const availableDateDataSets = fromJS([{ foo: 'bar' }]);
            const filterItems = fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]);
            const state = initialState.setIn([...Paths.BUCKETS, CATEGORIES, 'items'], filterItems)
                .setIn(Paths.SHORTCUT_DATE_DATASETS_AVAILABLE, availableDateDataSets);
            const stateWithFilter = state.setIn([...Paths.BUCKETS, FILTERS, 'items'], filterItems);
            const item = bucketItem({});

            beforeEach(() => {
                bucketsFilterReducer = sinon.stub().returns(stateWithFilter);
                bucketsReducer = sinon.stub();
                bucketsReducer.returns(stateWithFilter);

                helpers = require('../../utils/buckets_reducer_helpers');
                helpers.__Rewire__('bucketsReducer', bucketsReducer);
                helpers.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);

                shortcutsReducer(state, {
                    type: Actions.SHORTCUT_APPLY_METRIC_OVER_TIME,
                    payload: item
                });
            });

            afterEach(() => {
                shortcutsReducer.__ResetDependency__('helpers');
            });

            it('should add new item into Metrics', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
                expect(args.payload.keyName).to.eql(METRICS);
            });

            it('should granularity to quarter', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[1][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY);
                expect(args.payload.value).to.eql(GRANULARITY.quarter);
            });

            it('should update filter with granularity', () => {
                expect(bucketsFilterReducer).to.be.called();

                const args = bucketsFilterReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER);
            });

            it('should change visualisation type to Column', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[2][1];

                expect(args.type).to.eql(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE);
                expect(args.payload).to.eql('column');
            });
        });

        describe('without existing Date in Categories or Filters', () => {
            const state = initialState;
            const availableDateDataSets = fromJS([{ foo: 'bar' }]);
            const stateWithDateDataSets = state.setIn(Paths.SHORTCUT_DATE_DATASETS_AVAILABLE, availableDateDataSets);
            const stateWithCategoriesDate = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items'],
                fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]));
            const stateWithFiltersDate = stateWithCategoriesDate.setIn([...Paths.BUCKETS, FILTERS, 'items'],
                fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]));
            const item = bucketItem({});

            beforeEach(() => {
                bucketsFilterReducer = sinon.stub().returns(stateWithFiltersDate);
                bucketsReducer = sinon.stub();
                bucketsReducer.onCall(0).returns(state);
                bucketsReducer.onCall(1).returns(stateWithCategoriesDate);
                bucketsReducer.onCall(2).returns(stateWithCategoriesDate);
                bucketsReducer.onCall(3).returns(stateWithFiltersDate);
                bucketsReducer.onCall(4).returns(stateWithFiltersDate);
                bucketsReducer.returns(stateWithFiltersDate);

                helpers = require('../../utils/buckets_reducer_helpers');
                helpers.__Rewire__('bucketsReducer', bucketsReducer);
                helpers.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);

                shortcutsReducer(stateWithDateDataSets, {
                    type: Actions.SHORTCUT_APPLY_METRIC_OVER_TIME,
                    payload: item
                });
            });

            afterEach(() => {
                shortcutsReducer.__ResetDependency__('helpers');
            });

            it('should add new item into Metrics', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
                expect(args.payload.keyName).to.eql(METRICS);
            });

            it('should add new Date into Categories', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[1][1];

                expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
                expect(args.payload.keyName).to.eql(CATEGORIES);
            });

            it('should granularity to quarter', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[2][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY);
                expect(args.payload.value).to.eql(GRANULARITY.quarter);
            });

            it('should update filter with granularity', () => {
                expect(bucketsFilterReducer).to.be.called();

                const args = bucketsFilterReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER);
            });

            it('should add new Date into Filters', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[3][1];

                expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
                expect(args.payload.keyName).to.eql(FILTERS);
            });

            it('should change visualisation type to Column', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[4][1];

                expect(args.type).to.eql(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE);
                expect(args.payload).to.eql('column');
            });
        });
    });
});

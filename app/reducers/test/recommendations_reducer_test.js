import { fromJS } from 'immutable';

import * as Actions from '../../constants/Actions';
import recommendationsReducer from '../recommendations_reducer';
import initialState from '../initial_state';
import * as Paths from '../../constants/StatePaths';
import { METRICS, CATEGORIES, FILTERS } from '../../constants/bucket';
import { GRANULARITY } from '../../models/granularity';
import { VISUALIZATION_TYPE_BAR } from '../../models/visualization_type';
import { DATE_DATASET_ATTRIBUTE } from '../../models/date_item';

const DATE_DATASET_IDENTIFIER = 'date.dataset.dt';

describe('Recommendations Reducer tests', () => {
    describe('Apply Comparison With Period', () => {
        describe('without existing filter', () => {
            let helpers, bucketsReducer, bucketsFilterReducer;
            const state = initialState;
            const stateWithFilter = state.setIn([...Paths.BUCKETS, FILTERS, 'items'],
                fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]));
            const payload = GRANULARITY.month;

            beforeEach(() => {
                bucketsReducer = sinon.stub();
                bucketsReducer.onCall(0).returns(stateWithFilter);
                bucketsReducer.onCall(1).returns(stateWithFilter);
                bucketsReducer.returns(stateWithFilter);
                bucketsFilterReducer = sinon.stub();
                bucketsFilterReducer.returns(stateWithFilter);

                helpers = require('../../utils/buckets_reducer_helpers');
                helpers.__Rewire__('bucketsReducer', bucketsReducer);
                helpers.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);

                recommendationsReducer.__Rewire__('helpers', helpers);

                recommendationsReducer(state, {
                    type: Actions.RECOMMENDATION_COMPARISON_WITH_PERIOD,
                    payload
                });
            });

            afterEach(() => {
                recommendationsReducer.__ResetDependency__('helpers');
            });

            it('should add new date item into Filters', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
                expect(args.payload.keyName).to.eql(FILTERS);
            });

            it('should set granularity', () => {
                expect(bucketsFilterReducer).to.be.called();

                const args = bucketsFilterReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER);
                expect(args.payload.changes.interval.granularity).to.eql(GRANULARITY.month);
            });

            it('should set showPoP flag', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[1][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_POP);
                expect(args.payload.value).to.eql(true);
            });
        });

        describe('with existing filter', () => {
            let helpers, bucketsReducer, bucketsFilterReducer;
            const state = initialState.setIn([...Paths.BUCKETS, FILTERS, 'items'],
                fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]));
            const payload = GRANULARITY.month;

            beforeEach(() => {
                bucketsReducer = sinon.stub();
                bucketsReducer.returns(state);
                bucketsFilterReducer = sinon.stub();
                bucketsFilterReducer.returns(state);

                helpers = require('../../utils/buckets_reducer_helpers');
                helpers.__Rewire__('bucketsReducer', bucketsReducer);
                helpers.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);

                recommendationsReducer.__Rewire__('helpers', helpers);

                recommendationsReducer(state, {
                    type: Actions.RECOMMENDATION_COMPARISON_WITH_PERIOD,
                    payload
                });
            });

            afterEach(() => {
                recommendationsReducer.__ResetDependency__('helpers');
            });

            it('should set granularity', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsFilterReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER);
                expect(args.payload.changes.interval.granularity).to.eql(GRANULARITY.month);
            });

            it('should set showPoP flag', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_POP);
                expect(args.payload.value).to.eql(true);
            });
        });
    });

    describe('Apply Contribution In Percent', () => {
        let helpers, bucketsReducer, bucketsFilterReducer;
        const state = initialState.setIn([...Paths.BUCKETS, METRICS, 'items'],
            fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]));
        const payload = GRANULARITY.month;

        beforeEach(() => {
            bucketsReducer = sinon.stub();
            bucketsReducer.returns(state);
            bucketsFilterReducer = sinon.stub();
            bucketsFilterReducer.returns(state);

            helpers = require('../../utils/buckets_reducer_helpers');
            helpers.__Rewire__('bucketsReducer', bucketsReducer);
            helpers.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);

            recommendationsReducer.__Rewire__('helpers', helpers);


            recommendationsReducer(state, {
                type: Actions.RECOMMENDATION_CONTRIBUTION_IN_PERCENT,
                payload
            });
        });

        afterEach(() => {
            recommendationsReducer.__ResetDependency__('helpers');
        });

        it('should set showInPercent flag', () => {
            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT);
            expect(args.payload.value).to.eql(true);
        });

        it('should set correct visualisation type', () => {
            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[1][1];

            expect(args.type).to.eql(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE);
            expect(args.payload).to.eql(VISUALIZATION_TYPE_BAR);
        });
    });

    describe('Apply Metric With Period', () => {
        let helpers, bucketsReducer, bucketsFilterReducer;
        const state = initialState.setIn([...Paths.BUCKETS, METRICS, 'items'],
            fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]));
        const payload = GRANULARITY.month;

        beforeEach(() => {
            bucketsReducer = sinon.stub();
            bucketsReducer.returns(state);
            bucketsFilterReducer = sinon.stub();
            bucketsFilterReducer.returns(state);

            helpers = require('../../utils/buckets_reducer_helpers');
            helpers.__Rewire__('bucketsReducer', bucketsReducer);
            helpers.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);

            recommendationsReducer.__Rewire__('helpers', helpers);

            recommendationsReducer(state, {
                type: Actions.RECOMMENDATION_METRIC_WITH_PERIOD,
                payload
            });
        });

        afterEach(() => {
            recommendationsReducer.__ResetDependency__('helpers');
        });

        it('should set showInPercent flag', () => {
            expect(bucketsReducer).to.be.called();

            const args = bucketsReducer.args[0][1];

            expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_POP);
            expect(args.payload.value).to.eql(true);
        });
    });

    describe('Apply Trending', () => {
        const dateDataSet = { identifier: DATE_DATASET_IDENTIFIER };

        describe('without existing date in Category or Filters', () => {
            let helpers, newState, bucketsReducer, bucketsFilterReducer;
            const state = initialState
                .setIn(Paths.DATE_DATASETS_AVAILABLE, fromJS([
                    dateDataSet
                ]));
            const stateWithCategoryFilter = state
                .setIn([...Paths.BUCKETS, CATEGORIES, 'items'],
                    fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]));
            const stateWithFiltersFilter = stateWithCategoryFilter
                .setIn([...Paths.BUCKETS, FILTERS, 'items'],
                    fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]));
            const payload = GRANULARITY.month;

            beforeEach(() => {
                bucketsReducer = sinon.stub();
                bucketsReducer.onCall(0).returns(stateWithCategoryFilter);
                bucketsReducer.onCall(1).returns(stateWithCategoryFilter);
                bucketsReducer.onCall(2).returns(stateWithFiltersFilter);
                bucketsFilterReducer = sinon.stub();
                bucketsFilterReducer.returns(stateWithCategoryFilter);

                helpers = require('../../utils/buckets_reducer_helpers');
                helpers.__Rewire__('bucketsReducer', bucketsReducer);
                helpers.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);

                recommendationsReducer.__Rewire__('helpers', helpers);

                newState = recommendationsReducer(state, {
                    type: Actions.RECOMMENDATION_TRENDING,
                    payload
                });
            });

            afterEach(() => {
                recommendationsReducer.__ResetDependency__('helpers');
            });

            it('should add new date into Category bucket', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
                expect(args.payload.keyName).to.eql(CATEGORIES);
            });

            it('should set Category date item granularity', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[1][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY);

                expect(args.payload.value).to.eql(GRANULARITY.month);
            });

            it('should add new date into Filters bucket', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[2][1];

                expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
                expect(args.payload.keyName).to.eql(FILTERS);
            });

            it('should set Filter date item granularity to quarter', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsFilterReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER);
                expect(args.payload.changes.interval.granularity).to.eql(GRANULARITY.quarter);
            });

            it('should set available date dataset', () => {
                expect(newState.getIn(Paths.DATE_DATASETS_SELECTED).toJS()).to.eql(dateDataSet);
            });
        });

        describe('with existing date in Category but not in Filters', () => {
            let helpers, bucketsReducer, bucketsFilterReducer;
            const state = initialState.setIn([...Paths.BUCKETS, CATEGORIES, 'items'],
                fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]));
            const stateWithFiltersFilter = state.setIn([...Paths.BUCKETS, FILTERS, 'items'],
                fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]));
            const payload = GRANULARITY.month;

            beforeEach(() => {
                bucketsReducer = sinon.stub();
                bucketsReducer.onCall(0).returns(state);
                bucketsReducer.onCall(1).returns(stateWithFiltersFilter);
                bucketsReducer.onCall(2).returns(stateWithFiltersFilter);
                bucketsFilterReducer = sinon.stub();
                bucketsFilterReducer.returns(state);

                helpers = require('../../utils/buckets_reducer_helpers');
                helpers.__Rewire__('bucketsReducer', bucketsReducer);
                helpers.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);

                recommendationsReducer.__Rewire__('helpers', helpers);

                recommendationsReducer(state, {
                    type: Actions.RECOMMENDATION_TRENDING,
                    payload
                });
            });

            afterEach(() => {
                recommendationsReducer.__ResetDependency__('helpers');
            });

            it('should set Category date item granularity', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY);

                expect(args.payload.value).to.eql(GRANULARITY.month);
            });

            it('should add new date into Filters bucket', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[1][1];

                expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
                expect(args.payload.keyName).to.eql(FILTERS);
            });

            it('should set Filter date item granularity to quarter', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsFilterReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER);
                expect(args.payload.changes.interval.granularity).to.eql(GRANULARITY.quarter);
            });
        });

        describe('with existing date in Category and in Filters', () => {
            let helpers, bucketsReducer, bucketsFilterReducer;
            const state = initialState
                .setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]))
                .setIn([...Paths.BUCKETS, FILTERS, 'items'], fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]));
            const payload = GRANULARITY.month;

            beforeEach(() => {
                bucketsReducer = sinon.stub();
                bucketsReducer.returns(state);
                bucketsFilterReducer = sinon.stub();
                bucketsFilterReducer.returns(state);

                helpers = require('../../utils/buckets_reducer_helpers');
                helpers.__Rewire__('bucketsReducer', bucketsReducer);
                helpers.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);

                recommendationsReducer.__Rewire__('helpers', helpers);

                recommendationsReducer(state, {
                    type: Actions.RECOMMENDATION_TRENDING,
                    payload
                });
            });

            afterEach(() => {
                recommendationsReducer.__ResetDependency__('helpers');
            });

            it('should set Category date item granularity', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY);

                expect(args.payload.value).to.eql(GRANULARITY.month);
            });

            it('should set Filter date item granularity to quarter', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsFilterReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER);
                expect(args.payload.changes.interval.granularity).to.eql(GRANULARITY.quarter);
            });
        });

        describe('with existing date in Filters', () => {
            let helpers, bucketsReducer, newState, bucketsFilterReducer;
            const state = initialState
                .setIn(Paths.DATE_DATASETS_SELECTED, dateDataSet)
                .setIn(Paths.BUCKETS_FILTERS_ITEMS, fromJS([{ attribute: DATE_DATASET_ATTRIBUTE, filters: [{}] }]));
            const payload = GRANULARITY.month;

            beforeEach(() => {
                bucketsReducer = sinon.stub();
                bucketsReducer.returns(state);
                bucketsFilterReducer = sinon.stub();
                bucketsFilterReducer.returns(state);

                helpers = require('../../utils/buckets_reducer_helpers');
                helpers.__Rewire__('bucketsReducer', bucketsReducer);
                helpers.__Rewire__('bucketsFilterReducer', bucketsFilterReducer);

                recommendationsReducer.__Rewire__('helpers', helpers);

                newState = recommendationsReducer(state, {
                    type: Actions.RECOMMENDATION_TRENDING,
                    payload
                });
            });

            afterEach(() => {
                recommendationsReducer.__ResetDependency__('helpers');
            });

            it('should add new date into Category bucket', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_DND_ITEM_INSERT);
                expect(args.payload.keyName).to.eql(CATEGORIES);
            });

            it('should set Category date item granularity', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsReducer.args[1][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY);

                expect(args.payload.value).to.eql(GRANULARITY.month);
            });

            it('should set Filter date item granularity to quarter', () => {
                expect(bucketsReducer).to.be.called();

                const args = bucketsFilterReducer.args[0][1];

                expect(args.type).to.eql(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER);
                expect(args.payload.changes.interval.granularity).to.eql(GRANULARITY.quarter);
            });

            it('should keep selected date unmodified', () => {
                expect(newState.getIn(Paths.DATE_DATASETS_SELECTED)).to.equal(dateDataSet);
            });
        });
    });
});

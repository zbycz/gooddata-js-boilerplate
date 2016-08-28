import { fromJS } from 'immutable';
import { createActionStore } from '../../utils/test_action_store';
import * as ActionTypes from '../../constants/Actions';
import { METRICS } from '../../constants/bucket';
import * as Paths from '../../constants/StatePaths';
import { GRANULARITY } from '../../models/granularity';
import { bucketItem } from '../../models/bucket_item';

import initialState from '../../reducers/initial_state';
import * as Actions from '../recommendations_actions';

import { getProjectId } from '../../selectors/bootstrap_selector';
import { currentReportMDObject } from '../../selectors/buckets_selector';


describe('Recommendations actions', () => {
    let dispatch, findActionByType, messageLog;
    const testItem = { test: 'item' };

    function logMessage(projectId, message, params) {
        messageLog.push({ projectId, message, params });
    }

    const simpleFormatter = action => ({ message: action.type, params: action.payload });

    function createDependencies(attrs = {}) {
        return {
            ...attrs,
            log: logMessage,
            formatter: simpleFormatter
        };
    }

    function createExecutionReportDependencies() {
        return createDependencies({
            execute: () => ({ type: ActionTypes.REPORT_EXECUTION_STARTED })
        });
    }

    function expectActionLogged() {
        const { message, params } = messageLog[0];

        const action = findActionByType(message);
        expect(action).to.be.ok();
        expect(action.payload).to.eql(params);
    }

    function expectExecutedReport() {
        expect(findActionByType(ActionTypes.REPORT_EXECUTION_STARTED)).to.be.ok();
    }

    function expectCorrectAction(expectedAction) {
        const { message } = messageLog[0];

        const action = findActionByType(message);
        expect(action).to.be.ok();
        expect(action.type).to.eql(expectedAction.type);

        expect(action.payload).to.eql(expectedAction.payload);
    }

    function getInitialState(actionStore) {
        return actionStore
            .getState()
            .setIn([...Paths.BUCKETS, METRICS, 'items', 0], fromJS(testItem));
    }

    beforeEach(() => {
        messageLog = [];

        const actionStore = createActionStore();

        actionStore.setState(getInitialState(actionStore));

        dispatch = actionStore.dispatch;
        findActionByType = actionStore.findActionByType;
    });

    describe('#applyContributionInPercents', () => {
        const creator = Actions.applyContributionInPercents;
        const dependencies = createExecutionReportDependencies();

        beforeEach(() => {
            dispatch(creator(dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });

        it('should send correct message', () => {
            expectCorrectAction({
                type: ActionTypes.RECOMMENDATION_CONTRIBUTION_IN_PERCENT,
                payload: {}
            });
        });
    });

    describe('#applyMetricWithPeriod', () => {
        const creator = Actions.applyMetricWithPeriod;
        const dependencies = createExecutionReportDependencies();

        beforeEach(() => {
            dispatch(creator(dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });

        it('should send correct message', () => {
            expectCorrectAction({
                type: ActionTypes.RECOMMENDATION_METRIC_WITH_PERIOD,
                payload: {}
            });
        });
    });


    describe('#applyComparisonWithPeriod', () => {
        const creator = Actions.applyComparisonWithPeriod;
        const dependencies = createExecutionReportDependencies();

        beforeEach(() => {
            dispatch(creator(GRANULARITY.quarter, dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });

        it('should send correct message', () => {
            expectCorrectAction({
                type: ActionTypes.RECOMMENDATION_COMPARISON_WITH_PERIOD,
                payload: GRANULARITY.quarter
            });
        });
    });

    describe('#applyTrending', () => {
        const creator = Actions.applyTrending;
        const dependencies = createExecutionReportDependencies();
        const granularity = GRANULARITY.quarter;

        beforeEach(() => {
            dispatch(creator(granularity, dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });

        it('should send correct message', () => {
            const { message } = messageLog[0];
            expect(message).to.eql('RECOMMENDATION_TRENDING');
        });
    });

    describe('#applyComparison', () => {
        const creator = Actions.applyComparison;
        const dependencies = createExecutionReportDependencies();
        const attribute = 'my_attr';

        beforeEach(() => {
            dispatch(creator(attribute, dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });

        it('should send correct message', () => {
            const { message } = messageLog[0];
            expect(message).to.eql('RECOMMENDATION_COMPARISON');
        });
    });

    describe('#ensureAvailableAttributes', () => {
        let state, thunk, load, response;

        beforeEach(() => {
            load = sinon.stub().returns({ then: callback => callback(response) });
            dispatch = sinon.stub();

            state = initialState
                .setIn(Paths.ITEM_CACHE, fromJS({
                    'aaeFKXFYiCc0': {
                        expression: 'abc',
                        format: 'def',
                        id: 'aaeFKXFYiCc0',
                        identifier: 'aaeFKXFYiCc0',
                        isAvailable: true,
                        summary: '',
                        title: 'Awareness',
                        type: 'metric',
                        uri: '/gdc/md/TeamOneGoodSales1/obj/16212'
                    }
                }));

            thunk = Actions.ensureAvailableAttributes(load);

            response = { catalog: 'myItems' };
        });

        function run() {
            thunk(dispatch, () => state);
        }

        it('should not load attributes if metric did not change', () => {
            const metric = 'my_metric';

            state = state
                .setIn(Paths.AVAILABLE_ATTRIBUTES_METRIC, metric)
                .setIn(Paths.BUCKETS_METRICS_ITEMS, fromJS([{ attribute: metric }]));

            run();

            expect(load).not.to.be.called();
        });

        it('should load attributes if metric did change', () => {
            const metric = 'my_metric';

            state = state
                .setIn(Paths.AVAILABLE_ATTRIBUTES_METRIC, metric)
                .setIn(Paths.BUCKETS_METRICS_ITEMS, fromJS([bucketItem({ attribute: 'aaeFKXFYiCc0' })]));

            run();

            expect(load).to.be.calledWith(getProjectId(state), currentReportMDObject(state));
        });

        it('should dispatch correct actions', () => {
            const metric = 'my_metric';

            state = state
                .setIn(Paths.AVAILABLE_ATTRIBUTES_METRIC, metric)
                .setIn(Paths.BUCKETS_METRICS_ITEMS, fromJS([bucketItem({ attribute: 'aaeFKXFYiCc0' })]));

            run();

            expect(dispatch).to.be.calledWith(
                { type: ActionTypes.AVAILABLE_ATTRIBUTES_UPDATE, payload: { metric: 'aaeFKXFYiCc0' } }
            );

            expect(dispatch).to.be.calledWith(
                {
                    type: ActionTypes.AVAILABLE_ATTRIBUTES_UPDATED,
                    payload: {
                        metric: 'aaeFKXFYiCc0', items: response.catalog
                    }
                }
            );
        });
    });
});

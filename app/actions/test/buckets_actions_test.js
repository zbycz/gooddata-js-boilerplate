import { fromJS } from 'immutable';
import { createActionStore } from '../../utils/test_action_store';

import * as Actions from '../buckets_actions'; // eslint-disable-line
import { __RewireAPI__ as ActionsRewireApi } from '../buckets_actions'; // eslint-disable-line

const REPORT_EXECUTION = 'REPORT_EXECUTION';

describe('Buckets actions', () => {
    let dispatch, findActionByType, messageLog, reportIsValid;

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
            execute: () => ({ type: REPORT_EXECUTION })
        });
    }

    const dependencies = createExecutionReportDependencies();

    function expectActionLogged(index = 0) {
        const { message, params } = messageLog[index];

        const action = findActionByType(message);

        expect(action).to.be.ok();
        expect(action.payload).to.eql(params);
    }

    function expectExecutedReport(executed = true) {
        const action = findActionByType(REPORT_EXECUTION);

        if (executed) {
            expect(action).to.be.ok();
        } else {
            expect(action).not.to.be.ok();
        }
    }

    beforeEach(() => {
        messageLog = [];

        const actionStore = createActionStore();

        dispatch = actionStore.dispatch;
        findActionByType = actionStore.findActionByType;

        ActionsRewireApi.__Rewire__('shouldExecuteReportOnFilterChange', () => reportIsValid);
    });

    afterEach(() => {
        ActionsRewireApi.__ResetDependency__('shouldExecuteReportOnFilterChange');
    });

    describe('#selectVisualizationType', () => {
        beforeEach(() => {
            const payload = 'table';
            dispatch(Actions.selectVisualizationType(payload, dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });
    });

    describe('#setBucketItemShowInPercent', () => {
        beforeEach(() => {
            const payload = { value: true };
            dispatch(Actions.setBucketItemShowInPercent(payload, dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });
    });

    describe('#setBucketItemShowPoP', () => {
        beforeEach(() => {
            const payload = { value: true };
            dispatch(Actions.setBucketItemShowPoP(payload, dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });
    });

    describe('#setBucketItemAggregation', () => {
        beforeEach(() => {
            const payload = { value: 'MEDIAN' };
            dispatch(Actions.setBucketItemAggregation(payload, dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });
    });

    describe('#setBucketItemRemoveFilter', () => {
        const creator = Actions.setBucketItemRemoveFilter;
        const payload = {
            bucketItem: fromJS({
                filters: [{
                    attribute: 'attr',
                    selectedElements: [{}]
                }]
            })
        };

        it('should execute report if report is valid', () => {
            reportIsValid = true;
            dispatch(creator(payload, dependencies));

            expectExecutedReport();
        });

        it('should not execute report if report is not valid', () => {
            reportIsValid = false;
            dispatch(creator(payload, dependencies));

            expectExecutedReport(false);
        });

        it('should create a log entry', () => {
            dispatch(creator(payload, dependencies));

            expectActionLogged();
        });
    });

    describe('#setBucketItemUpdateMetricFilter', () => {
        const creator = Actions.setBucketItemUpdateMetricFilter;
        const payload = { value: 'MEDIAN' };

        it('should execute report if report is valid', () => {
            reportIsValid = true;
            dispatch(creator(payload, dependencies));

            expectExecutedReport();
        });

        it('should not execute report if report is not valid', () => {
            reportIsValid = false;
            dispatch(creator(payload, dependencies));

            expectExecutedReport(false);
        });

        it('should create a log entry', () => {
            dispatch(creator(payload, dependencies));

            expectActionLogged();
        });
    });

    describe('#setBucketItemRemoveMetricFilter', () => {
        const creator = Actions.setBucketItemRemoveMetricFilter;
        const payload = {};

        it('should execute report if report is valid', () => {
            reportIsValid = true;
            dispatch(creator(payload, dependencies));

            expectExecutedReport();
        });

        it('should not execute report if report is not valid', () => {
            reportIsValid = false;
            dispatch(creator(payload, dependencies));

            expectExecutedReport(false);
        });
    });

    describe('#setBucketItemUpdateFilter', () => {
        const creator = Actions.setBucketItemUpdateFilter;
        const payload = { value: 'MEDIAN' };

        it('should execute report if report is valid', () => {
            reportIsValid = true;
            dispatch(creator(payload, dependencies));

            expectExecutedReport();
        });

        it('should not execute report if report is not valid', () => {
            reportIsValid = false;
            dispatch(creator(payload, dependencies));

            expectExecutedReport(false);
        });

        it('should create a log entry', () => {
            dispatch(creator(payload, dependencies));

            expectActionLogged();
        });
    });

    describe('#setBucketItemDateDataSet', () => {
        beforeEach(() => {
            const payload = 'date-dataset';
            dispatch(Actions.setBucketItemDateDataSet(payload, dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });
    });

    describe('#setBucketItemGranularity', () => {
        beforeEach(() => {
            const payload = 'granularity';
            dispatch(Actions.setBucketItemGranularity(payload, dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });
    });
});

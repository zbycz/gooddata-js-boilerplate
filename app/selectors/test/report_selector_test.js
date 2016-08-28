import { fromJS } from 'immutable';
import reportSelector, {
    isReportTooLargeSelector,
    isReportMissingMetric,
    isInvalidConfigurationSelector,
    isReportEmptySelector,
    isDataTooLargeToComputeSelector,
    isDataTooLargeToDisplaySelector,
    isReportValid,
    shouldExecuteReportOnFilterChange
} from '../report_selector';
import * as StatePaths from '../../constants/StatePaths';
import initialState from '../../reducers/initial_state';
import {
    ENTITY_TOO_LARGE,
    INVALID_CONFIGURATION,
    DATA_TOO_LARGE_TO_DISPLAY,
    INTERNAL_SERVER_ERROR
} from '../../constants/Errors';
import * as VisualizationTypes from '../../constants/visualizationTypes';
import { CATEGORIES, METRICS } from '../../constants/bucket';

describe('reportSelector', () => {
    describe('isReportTooLargeSelector', () => {
        it('should return false by default', () => {
            expect(isReportTooLargeSelector(initialState)).to.equal(false);
        });
    });

    describe('isDataTooLargeToComputeSelector', () => {
        it('should return true if there is a 413 error', () => {
            const state = initialState
                .setIn(StatePaths.REPORT_EXECUTION_ERROR, fromJS({ status: ENTITY_TOO_LARGE }));

            expect(isDataTooLargeToComputeSelector(state)).to.equal(true);
        });
    });

    describe('isReportMissingMetric', () => {
        it('should return false if there is no data', () => {
            expect(isReportMissingMetric(initialState)).to.equal(false);
        });

        it('should return false for table with data', () => {
            const data = fromJS({ foo: 'bar' });
            const state = initialState
                .setIn(StatePaths.VISUALIZATION_TYPE, VisualizationTypes.TABLE)
                .setIn(StatePaths.REPORT_EXECUTION_DATA, data);
            expect(isReportMissingMetric(state)).to.equal(false);
        });

        it('should return false for chart with data & one metric', () => {
            const data = fromJS({ foo: 'bar' });
            const metricItem = fromJS(['foo', 'bar']);
            const state = initialState
                .setIn(StatePaths.REPORT_EXECUTION_DATA, data)
                .setIn(StatePaths.VISUALIZATION_TYPE, VisualizationTypes.COLUMN_CHART)
                .setIn([...StatePaths.BUCKETS, METRICS, 'items'], metricItem);
            expect(isReportMissingMetric(state)).to.equal(false);
        });

        it('should return true for chart with data & one attribute', () => {
            const data = fromJS({ foo: 'bar' });
            const categoryItem = fromJS(['foo', 'bar']);
            const state = initialState
                .setIn(StatePaths.REPORT_EXECUTION_DATA, data)
                .setIn(StatePaths.VISUALIZATION_TYPE, VisualizationTypes.COLUMN_CHART)
                .setIn([...StatePaths.BUCKETS, CATEGORIES, 'items'], categoryItem);
            expect(isReportMissingMetric(state)).to.equal(true);
        });

        it('should return false for chart with some metric', () => {
            const data = fromJS({ foo: 'bar' });
            const metricItem = fromJS(['foo', 'bar']);
            const state = initialState
                .setIn(StatePaths.REPORT_EXECUTION_DATA, data)
                .setIn(StatePaths.VISUALIZATION_TYPE, VisualizationTypes.COLUMN_CHART)
                .setIn([...StatePaths.BUCKETS, METRICS, 'items'], metricItem);
            expect(isReportMissingMetric(state)).to.equal(false);
        });

        it('should return true if visualization is chart, data is too large to compute & no metric', () => {
            const data = false;
            const categoryItem = fromJS(['foo', 'bar']);
            const state = initialState
                .setIn(StatePaths.REPORT_EXECUTION_DATA, data)
                .setIn(StatePaths.VISUALIZATION_TYPE, VisualizationTypes.COLUMN_CHART)
                .setIn([...StatePaths.BUCKETS, CATEGORIES, 'items'], categoryItem)
                .setIn(StatePaths.REPORT_EXECUTION_ERROR, fromJS({ status: ENTITY_TOO_LARGE }));
            expect(isReportMissingMetric(state)).to.equal(true);
        });
    });

    describe('isDataTooLargeToDisplaySelector', () => {
        it('should return true if data is too large to display', () => {
            const state = initialState
                .setIn(StatePaths.REPORT_EXECUTION_ERROR, fromJS({ status: DATA_TOO_LARGE_TO_DISPLAY }));

            expect(isDataTooLargeToDisplaySelector(state)).to.equal(true);
        });
    });

    describe('isExecutionRunning', () => {
        it('should not be running by default', () => {
            let { isExecutionRunning } = reportSelector(initialState);
            expect(isExecutionRunning).to.equal(false);
        });

        it('should return is execution running', () => {
            const state = initialState.setIn(StatePaths.REPORT_EXECUTION_RUNNING, true);
            expect(reportSelector(state).isExecutionRunning).to.equal(true);
        });
    });

    describe('visualizationType', () => {
        it('should be "column" by default', () => {
            expect(reportSelector(initialState).config.type).to.equal('column');
        });

        it('should return visualization type', () => {
            const state = initialState.setIn(StatePaths.VISUALIZATION_TYPE, 'table');
            let { config } = reportSelector(state);

            expect(config.type).to.equal('table');
        });
    });

    describe('data', () => {
        it('should be null by default', () => {
            expect(reportSelector(initialState).data).to.equal(null);
        });

        it('should return "data" object from state', () => {
            let sourceData = {
                headers: [], rawData: []
            };
            const state = initialState.setIn(StatePaths.REPORT_EXECUTION_DATA, fromJS(sourceData));
            let { data } = reportSelector(state);
            expect(data).to.eql(sourceData);
        });
    });

    describe('isInvalidConfiguration', () => {
        it('should be false when not set', () => {
            expect(isReportTooLargeSelector(initialState)).to.equal(false);
        });

        it('should be true if the error code is 400', () => {
            const state = initialState.setIn(StatePaths.REPORT_EXECUTION_ERROR_STATUS, INVALID_CONFIGURATION);

            expect(isInvalidConfigurationSelector(state)).to.equal(true);
        });

        it('should be true if the error code is 500', () => {
            const state = initialState.setIn(StatePaths.REPORT_EXECUTION_ERROR_STATUS, INTERNAL_SERVER_ERROR);

            expect(isInvalidConfigurationSelector(state)).to.equal(true);
        });
    });

    describe('isEmpty', () => {
        it('should return "report.execution.data.isEmpty" property from state', () => {
            const state = initialState.setIn(StatePaths.REPORT_EXECUTION_DATA, fromJS({ isEmpty: true }));

            expect(isReportEmptySelector(state)).to.equal(true);
        });
    });

    describe('isReportValid', () => {
        let state;

        beforeEach(() => {
            state = initialState
                .setIn(StatePaths.VISUALIZATION_TYPE, 'table')
                .setIn(StatePaths.REPORT_EXECUTION_DATA, fromJS({ rawData: [], headers: [] }));
        });

        it('should be true when report is valid', () => {
            expect(isReportValid(state)).to.be.true();
        });

        it('should be false when report has not been executed yet', () => {
            state = state
                .setIn(StatePaths.REPORT_EXECUTION_DATA, null);

            expect(isReportValid(state)).to.be.false();
        });

        it('should be false when report is too large', () => {
            state = state
                .setIn([...StatePaths.REPORT_EXECUTION_ERROR, 'status'], ENTITY_TOO_LARGE);

            expect(isReportValid(state)).to.be.false();
        });

        it('should be false when report has invalid configuration', () => {
            state = state
                .setIn([...StatePaths.REPORT_EXECUTION_ERROR, 'status'], INVALID_CONFIGURATION);

            expect(isReportValid(state)).to.be.false();
        });

        it('should be false when report is empty', () => {
            state = state
                .setIn(StatePaths.REPORT_EXECUTION_DATA, fromJS({ isEmpty: true }));

            expect(isReportValid(state)).to.be.false();
        });

        it('should be false when report is missing metrics', () => {
            state = initialState
                .setIn(StatePaths.VISUALIZATION_TYPE, 'column');

            expect(isReportValid(state)).to.be.false();
        });
    });

    describe('shouldExecuteReportOnFilterChange', () => {
        let state;

        beforeEach(() => {
            state = initialState
                .setIn(StatePaths.VISUALIZATION_TYPE, 'table')
                .setIn(StatePaths.REPORT_EXECUTION_DATA, fromJS({ rawData: [], headers: [] }));
        });

        it('should be true when report is valid', () => {
            expect(shouldExecuteReportOnFilterChange(state)).to.be.true();
        });

        it('should be false when report has not been executed yet', () => {
            state = state
                .setIn(StatePaths.REPORT_EXECUTION_DATA, null);

            expect(shouldExecuteReportOnFilterChange(state)).to.be.false();
        });

        it('should be true when report is too large', () => {
            state = state
                .setIn(StatePaths.REPORT_EXECUTION_DATA, null)
                .setIn([...StatePaths.REPORT_EXECUTION_ERROR, 'status'], ENTITY_TOO_LARGE);

            expect(shouldExecuteReportOnFilterChange(state)).to.be.true();
        });

        it('should be true when report is executing', () => {
            state = state
                .setIn(StatePaths.REPORT_EXECUTION_DATA, null)
                .setIn(StatePaths.REPORT_EXECUTION_RUNNING, true);

            expect(shouldExecuteReportOnFilterChange(state)).to.be.true();
        });

        it('should be true when report has invalid configuration', () => {
            state = state
                .setIn([...StatePaths.REPORT_EXECUTION_ERROR, 'status'], INVALID_CONFIGURATION);

            expect(shouldExecuteReportOnFilterChange(state)).to.be.true();
        });

        it('should be true when report is empty', () => {
            state = state
                .setIn(StatePaths.REPORT_EXECUTION_DATA, fromJS({ isEmpty: true }));

            expect(shouldExecuteReportOnFilterChange(state)).to.be.true();
        });

        it('should be false when report is missing metrics', () => {
            state = initialState
                .setIn(StatePaths.VISUALIZATION_TYPE, 'column');

            expect(shouldExecuteReportOnFilterChange(state)).to.be.false();
        });
    });
});

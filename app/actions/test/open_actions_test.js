import { openReport } from '../open_actions';
import * as Actions from '../../constants/Actions';

import { createActionStore } from '../../utils/test_action_store';
import { createTestLogging } from '../../utils/test_logging';

import initialState from '../../reducers/initial_state';
import { REPORT_EXECUTION_DATA } from '../../constants/StatePaths';
import { createLoggerService } from '../../utils/test_logger_service';

describe('OpenActions', () => {
    describe('openReport', () => {
        function createDependencies(customDeps = {}) {
            const getObjects = sinon.spy((projectId, updatedReportObject) => Promise.resolve(updatedReportObject));
            const LoggerService = createLoggerService();
            const loadAdditionalData = sinon.spy(() => Promise.resolve({}));
            const defaultDeps = {
                log: () => {},
                formatter: () => {},
                loggerService: LoggerService,
                getObjects,
                loadAdditionalData,
                execute: () => ({ type: 'REPORT_EXECUTION' })
            };

            return {
                ...defaultDeps,
                ...customDeps
            };
        }

        it('should call SHOW_DIALOG_OPEN_REPORT_CONFIRMATION action if save button is enabled', () => {
            const state = initialState.setIn(REPORT_EXECUTION_DATA, { foo: 'data' });
            const actionStore = createActionStore();
            actionStore.setState(state);

            const dispatch = actionStore.dispatch;
            const findActionByType = actionStore.findActionByType;
            const dependencies = createDependencies();

            const action = openReport({}, dependencies);

            dispatch(action);

            const openReportAction = findActionByType(Actions.SHOW_DIALOG_OPEN_REPORT_CONFIRMATION);

            expect(openReportAction).to.be.ok();
        });

        it('should call OPEN_REPORT_STARTED and OPEN_REPORT_FINISHED action and log GA if save button is enabled and call api', done => {
            const actionStore = createActionStore();
            const dispatch = actionStore.dispatch;
            const findActionByType = actionStore.findActionByType;

            const data = {
                report: {
                    content: {
                        buckets: {
                            measures: [{
                                objectUri: 'test'
                            }]
                        }
                    }
                }
            };
            const dependencies = createDependencies();
            const action = openReport(data, dependencies);

            dispatch(action).then(() => {
                const openReportAction = findActionByType(Actions.OPEN_REPORT_STARTED);
                const openReportFinishedAction = findActionByType(Actions.OPEN_REPORT_FINISHED);

                expect(openReportAction).to.be.ok();
                expect(openReportFinishedAction).to.be.ok();
                expect(dependencies.loadAdditionalData.getCall(0).args[0]).to.eql(data.report);
                expect(dependencies.loggerService.logVisualizationOpen).to.be.calledOnce();

                done();
            });
        });

        it('should log action on success api call', () => {
            const { log, formatter, findLogEntryByMessage } = createTestLogging();
            const actionStore = createActionStore();
            const dispatch = actionStore.dispatch;
            const dependencies = createDependencies({
                log, formatter
            });

            const data = {
                report: {
                    content: {
                        buckets: {
                            measures: [{
                                objectUri: 'test'
                            }]
                        }
                    }
                }
            };
            const action = openReport(data, dependencies);

            return dispatch(action).then(() => {
                expect(
                    findLogEntryByMessage(Actions.OPEN_REPORT_FINISHED)
                ).to.be.ok();
            });
        });
    });
});

import {
    executeReport,
    reportExecutionStarted,
    reportExecutionFinished,
    exportReport,
    reportTitleChange,
    dataTooLargeToDisplay
 } from '../report_actions';
import * as Actions from '../../constants/Actions';

import { fromJS } from 'immutable';

import { createActionStore } from '../../utils/test_action_store';
import { createTestLogging } from '../../utils/test_logging';
import initialState from '../../reducers/initial_state';
import * as StatePaths from '../../constants/StatePaths';
import { createLoggerService } from '../../utils/test_logger_service';

describe('ReportActions', () => {
    let dispatch, findActionByType;
    let defaultDependecies, findLogEntryByMessage, actionStore, LoggerService;

    const report = Symbol('report');
    const executedReport = Symbol('executedReport');

    beforeEach(() => {
        LoggerService = createLoggerService();
        actionStore = createActionStore();
        dispatch = actionStore.dispatch;
        findActionByType = actionStore.findActionByType;

        defaultDependecies = {
            ...createTestLogging(),
            loggerService: LoggerService
        };

        findLogEntryByMessage = defaultDependecies.findLogEntryByMessage;
    });

    describe('reportExecutionStarted', () => {
        it('creates unique id for each execution', () => {
            let actionOne = reportExecutionStarted();
            let actionTwo = reportExecutionStarted();

            expect(actionOne.meta.id).not.to.equal(actionTwo.meta.id);
        });
    });

    describe('reportExecutionFinished', () => {
        it('should contain provided meta', () => {
            let data = {},
                meta = {
                    id: 1,
                    startTime: 'today'
                };

            let action = reportExecutionFinished(data, meta);

            expect(action.meta.id).to.equal(meta.id);
            expect(action.meta.startTime).to.equal(meta.startTime);
        });
    });

    describe('dataTooLargeToDisplay', () => {
        it('should create action with error', () => {
            const action = dataTooLargeToDisplay();

            expect(action.error).to.equal(true);
        });
    });

    describe('executeReport', () => {
        it('should log first execution', done => {
            actionStore.setState(initialState.setIn(StatePaths.REPORT_EXECUTION_FIRST, true));

            let reportFactory = sinon.stub().returns(report);
            let execute = sinon.stub().returns(Promise.resolve(executedReport));

            let action = executeReport({
                ...defaultDependecies,
                reportFactory, execute
            });

            dispatch(action);

            setTimeout(() => {
                expect(LoggerService.logFirstExecution).to.be.calledOnce();
                done();
            }, 0);
        });

        it('should toggle report execution and call GA', done => {
            let reportFactory = sinon.stub().returns(report);
            let execute = sinon.stub().returns(Promise.resolve(executedReport));

            let action = executeReport({
                ...defaultDependecies,
                reportFactory, execute
            });

            dispatch(action);

            const execStarted = findActionByType(Actions.REPORT_EXECUTION_STARTED);
            expect(execStarted).not.to.equal(undefined);

            setTimeout(() => {
                const execFinished = findActionByType(Actions.REPORT_EXECUTION_FINISHED);

                expect(LoggerService.logVisualizationExecuted).to.be.calledOnce();
                expect(execFinished).not.to.equal(undefined);
                expect(execFinished.payload).to.equal(executedReport);

                done();
            }, 0);
        });

        it('should fail report execution and call GA', done => {
            let reportFactory = sinon.stub().returns(report);
            let execute = sinon.stub().returns(Promise.reject(new Error('exec failed')));

            let action = executeReport({
                ...defaultDependecies,
                reportFactory, execute
            });

            dispatch(action);

            const execStarted = findActionByType(Actions.REPORT_EXECUTION_STARTED);
            expect(execStarted).not.to.equal(undefined);

            setTimeout(() => {
                expect(LoggerService.logVisualizationExecutionFailed).to.be.calledOnce();

                const execFailed = findActionByType(Actions.REPORT_EXECUTION_ERROR);
                expect(execFailed.error).not.to.equal(undefined);
                done();
            }, 0);
        });

        it('should log report execution start & success', done => {
            let reportFactory = sinon.stub().returns(report);
            let execute = sinon.stub().returns(Promise.resolve(executedReport));

            let action = executeReport({
                ...defaultDependecies,
                reportFactory, execute
            });

            dispatch(action);

            const execStarted = findLogEntryByMessage(Actions.REPORT_EXECUTION_STARTED);
            expect(execStarted).not.to.equal(undefined);

            setTimeout(() => {
                const execFailed = findLogEntryByMessage(Actions.REPORT_EXECUTION_FINISHED);

                expect(execFailed.params.payload).to.equal(executedReport);
                done();
            }, 0);
        });

        it('should log report execution start & fail', done => {
            let reportFactory = sinon.stub().returns(report);
            let execute = sinon.stub().returns(Promise.reject(new Error('exec failed')));

            let action = executeReport({
                ...defaultDependecies,
                reportFactory, execute
            });

            dispatch(action);

            const execStarted = findLogEntryByMessage(Actions.REPORT_EXECUTION_STARTED);
            expect(execStarted).not.to.equal(undefined);

            setTimeout(() => {
                const execFailed = findLogEntryByMessage(Actions.REPORT_EXECUTION_ERROR);

                expect(execFailed.params.error).not.to.equal(undefined);
                done();
            }, 0);
        });
    });

    describe('exportReport', () => {
        const projectId = 'export_report_project_id';
        const REPORT_URI = '/gdc/dummyProjectId/export/report/';
        const successExportPromise = () => Promise.resolve({ uri: REPORT_URI });
        const startTime = 1;
        const endTime = 2;
        const visualization = fromJS({
            visualization: {
                content: {
                    type: 'line',
                    buckets: {
                        measures: [],
                        category: [],
                        filters: []
                    }
                },
                meta: {}
            }
        });
        let windowOpenSpy;
        let sandbox;
        let dateStub;

        function createExportReportAction(done, exportPromise = successExportPromise) {
            return exportReport({
                ...defaultDependecies,
                visualizationForExport: () => visualization,
                makeExportRequest: () => {
                    done();
                    return exportPromise;
                }
            });
        }

        it('should call "reportFactory"', done => {
            const action = createExportReportAction(done);
            dispatch(action);
        });

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            windowOpenSpy = sandbox.stub(window, 'open');
            dateStub = sandbox.stub(Date, 'now');
            dateStub.onCall(0).returns(startTime);
            dateStub.onCall(1).returns(endTime);
            actionStore.setState(initialState.setIn(StatePaths.PROJECT_ID, projectId));
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should call "window.open"', done => {
            const action = createExportReportAction(() => {
                setTimeout(() => {
                    expect(windowOpenSpy).to.be.calledOnce();
                    expect(windowOpenSpy).to.be.calledWith(`/#s=/gdc/projects/export_report_project_id|analysisPage|${REPORT_URI}|empty-report`);
                    done();
                });
            }, successExportPromise());

            dispatch(action);
        });

        it('should GA log logOpenAsReport', done => {
            const action = createExportReportAction(() => {
                setTimeout(() => {
                    expect(LoggerService.logOpenAsReport).to.be.calledOnce();
                    done();
                });
            }, successExportPromise());

            dispatch(action);
        });

        it(`should log ${Actions.REPORT_EXPORT_STARTED} & ${Actions.REPORT_EXPORT_FINISHED}`, done => {
            const action = createExportReportAction(() => {
                setTimeout(() => {
                    const exportStartedAction = findActionByType(Actions.REPORT_EXPORT_STARTED);
                    expect(exportStartedAction).to.be.ok();
                    expect(exportStartedAction).to.be.eql({
                        type: Actions.REPORT_EXPORT_STARTED,
                        meta: {
                            startTime,
                            projectId,
                            id: exportStartedAction.meta.id
                        }
                    });

                    const exportFinishedAction = findActionByType(Actions.REPORT_EXPORT_FINISHED);
                    expect(exportFinishedAction).to.be.ok();
                    expect(exportFinishedAction).to.eql({
                        type: Actions.REPORT_EXPORT_FINISHED,
                        meta: {
                            projectId,
                            startTime,
                            endTime,
                            uri: REPORT_URI,
                            id: exportFinishedAction.meta.id
                        }
                    });

                    const exportStartedLog = findLogEntryByMessage(Actions.REPORT_EXPORT_STARTED);
                    expect(exportStartedLog).to.be.ok();
                    expect(exportStartedLog.projectId).to.equal(projectId);

                    const exportFinishedLog = findLogEntryByMessage(Actions.REPORT_EXPORT_FINISHED);
                    expect(exportFinishedLog).to.be.ok();
                    expect(exportFinishedLog.projectId).to.equal(projectId);

                    done();
                });
            }, successExportPromise());

            dispatch(action);
        });

        it(`should log ${Actions.REPORT_EXPORT_STARTED} & ${Actions.REPORT_EXPORT_ERROR}`, done => {
            const error = {
                status: 403,
                statusText: 'not allowed'
            };
            const rejectExportPromise = Promise.reject(error);

            const action = createExportReportAction(() => {
                // execution is async and so we need do set a timeout for promise to resolve
                setTimeout(() => {
                    const exportStartedAction = findActionByType(Actions.REPORT_EXPORT_STARTED);
                    expect(exportStartedAction).to.be.ok();
                    expect(exportStartedAction).to.be.eql({
                        type: Actions.REPORT_EXPORT_STARTED,
                        meta: {
                            startTime,
                            projectId,
                            id: exportStartedAction.meta.id
                        }
                    });

                    const exportErrorAction = findActionByType(Actions.REPORT_EXPORT_ERROR);
                    expect(exportErrorAction).to.be.ok();
                    expect(exportErrorAction).to.eql({
                        type: Actions.REPORT_EXPORT_ERROR,
                        payload: error,
                        error: true,
                        meta: {
                            projectId,
                            startTime,
                            endTime,
                            statusCode: 403,
                            statusText: 'not allowed',
                            id: exportErrorAction.meta.id
                        }
                    });

                    const exportStartedLog = findLogEntryByMessage(Actions.REPORT_EXPORT_STARTED);
                    expect(exportStartedLog).to.be.ok();
                    expect(exportStartedLog.projectId).to.equal(projectId);

                    const exportErrorLog = findLogEntryByMessage(Actions.REPORT_EXPORT_ERROR);
                    expect(exportErrorLog).to.be.ok();
                    expect(exportErrorLog.projectId).to.equal(projectId);

                    done();
                });
            }, rejectExportPromise);

            dispatch(action);
        });
    });

    describe('reportTitleChange', () => {
        it('shall change report title in state', () => {
            const action = reportTitleChange();

            dispatch(action);

            const reportTitleChangeAction = findActionByType(Actions.REPORT_TITLE_CHANGE);
            expect(reportTitleChangeAction).to.be.ok();
        });
    });
});

import { deleteReport } from '../delete_actions';
import { fromJS } from 'immutable';
import * as Actions from '../../constants/Actions';
import { createTestLogging } from '../../utils/test_logging';
import { createActionStore } from '../../utils/test_action_store';
import { createLoggerService } from '../../utils/test_logger_service';

describe('DeleteActions', () => {
    describe('deleteReport', () => {
        let dispatch, actionStore, findActionByType;
        const reportUri = '/obj/1';
        const actionPayload = {
            forceDelete: true,
            report: fromJS({
                meta: {
                    uri: reportUri
                }
            })
        };

        beforeEach(() => {
            actionStore = createActionStore();
            dispatch = actionStore.dispatch;
            findActionByType = actionStore.findActionByType;
        });

        function createDependencies(customDeps = {}) {
            const LoggerService = createLoggerService();
            const deleteObject = sinon.spy(() => Promise.resolve());
            const defaultDeps = {
                log: () => {},
                formatter: () => {},
                loggerService: LoggerService,
                deleteObject
            };

            return {
                ...defaultDeps,
                ...customDeps
            };
        }

        it('should call SHOW_DIALOG_DELETE_REPORT_CONFIRMATION action if not forcing', () => {
            const dependencies = createDependencies();
            const action = deleteReport({}, dependencies);

            dispatch(action);

            const deleteReportConfirmAction = findActionByType(Actions.SHOW_DIALOG_DELETE_REPORT_CONFIRMATION);
            expect(deleteReportConfirmAction).to.be.ok();
            expect(dependencies.deleteObject).not.to.be.called();
        });

        it('should delete object via api on forceDelete', () => {
            const { log, formatter, findLogEntryByMessage } = createTestLogging();
            const dependencies = createDependencies({
                log, formatter
            });

            const action = deleteReport({
                forceDelete: true,
                report: fromJS({
                    meta: {
                        uri: reportUri
                    }
                })
            }, dependencies);

            const actionPromise = dispatch(action);

            const deleteReportAction = findActionByType(Actions.DELETE_REPORT_STARTED);
            expect(deleteReportAction).to.be.ok();
            expect(dependencies.deleteObject).to.be.calledOnce();
            expect(dependencies.deleteObject).to.be.calledWith(reportUri);

            return actionPromise.then(() => {
                expect(
                    findLogEntryByMessage(Actions.DELETE_REPORT_FINISHED)
                ).to.be.ok();
            });
        });

        it('should call GA logVisualizationDeleteFailed when delete fails', done => {
            const deleteObject = sinon.spy(() => Promise.reject());
            const dependencies = createDependencies({
                deleteObject
            });

            const action = deleteReport(actionPayload, dependencies);

            dispatch(action).then(() => {
                expect(dependencies.loggerService.logVisualizationDeleteFailed).to.be.calledOnce();
                done();
            });
        });

        it('should log message when delete fails', () => {
            const deleteObject = sinon.spy(() => Promise.reject());
            const { log, formatter, findLogEntryByMessage } = createTestLogging();
            const dependencies = createDependencies({
                log,
                formatter,
                deleteObject
            });

            const action = deleteReport(actionPayload, dependencies);

            return dispatch(action).then(() => {
                expect(
                    findLogEntryByMessage(Actions.DELETE_REPORT_ERROR)
                ).to.be.ok();
            });
        });

        it('should call GA logVisualizationDeleted', done => {
            const dependencies = createDependencies();
            const action = deleteReport(actionPayload, dependencies);

            dispatch(action).then(() => {
                expect(dependencies.loggerService.logVisualizationDeleted).to.be.calledOnce();
                done();
            });
        });
    });
});

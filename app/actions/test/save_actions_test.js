import { saveReport, saveReportCheck } from '../save_actions';
import * as Actions from '../../constants/Actions';
import * as StatePaths from '../../constants/StatePaths';

import initialState from '../../reducers/initial_state';

import { createActionStore } from '../../utils/test_action_store';
import { createLoggerService } from '../../utils/test_logger_service';
import { createTestLogging } from '../../utils/test_logging';

describe('SaveActions', () => {
    let dispatch, findActionByType, actionStore;
    const state = initialState
        .setIn(StatePaths.VISUALIZATION_TYPE, 'table');

    beforeEach(() => {
        actionStore = createActionStore();
        actionStore.setState(state);
        dispatch = actionStore.dispatch;
        findActionByType = actionStore.findActionByType;
    });

    describe('saveReport', () => {
        beforeEach(() => {
            actionStore.setState(
                actionStore
                    .getState()
                    .setIn(StatePaths.REPORT_CURRENT_TITLE, 'New report')
            );
        });

        function createDependencies(customDeps = {}) {
            const LoggerService = createLoggerService();
            const apiSaveReport = sinon.spy(payload => Promise.resolve(payload.reportMDObject));
            const defaultDeps = {
                log: () => {},
                formatter: () => {},
                loggerService: LoggerService,
                apiSaveReport
            };

            return {
                ...defaultDeps,
                ...customDeps
            };
        }

        it('should call SAVE_REPORT_STARTED action and after successful api call SAVE_REPORT_FINISHED action', () => {
            const dependencies = createDependencies();
            const action = saveReport(false, dependencies);

            return dispatch(action).then(() => {
                const saveReportAction = findActionByType(Actions.SAVE_REPORT_STARTED);
                expect(saveReportAction).to.be.ok();
                expect(saveReportAction.payload.timeoutId).to.be.above(0);

                expect(dependencies.apiSaveReport.getCall(0).args[0].reportMDObject.visualization.content.type).to.eql('table');

                const saveReportFinishedAction = findActionByType(Actions.SAVE_REPORT_FINISHED);
                expect(saveReportFinishedAction).to.be.ok();
                expect(saveReportFinishedAction.payload.reportMDObject.visualization.content.type).to.eql('table');
            });
        });

        it('should GA log logVisualizationSaved on first save', () => {
            const dependencies = createDependencies();
            const action = saveReport(false, dependencies);

            return dispatch(action).then(() => {
                expect(dependencies.loggerService.logVisualizationSaved).to.be.calledOnce();
            });
        });

        it('should log action on success api call', () => {
            const { log, formatter, findLogEntryByMessage } = createTestLogging();
            const dependencies = createDependencies({
                log, formatter
            });

            const action = saveReport(false, dependencies);
            return dispatch(action).then(() => {
                expect(
                    findLogEntryByMessage(Actions.SAVE_REPORT_FINISHED)
                ).to.be.ok();
            });
        });

        it('should call SAVE_REPORT_ERROR action when api call fails', () => {
            const apiSaveReport = sinon.stub().returns(Promise.reject({}));
            const dependencies = createDependencies({
                apiSaveReport
            });

            const action = saveReport(false, dependencies);

            return dispatch(action).then(() => {
                const saveReportAction = findActionByType(Actions.SAVE_REPORT_STARTED);
                expect(saveReportAction).to.be.ok();
                expect(saveReportAction.payload.timeoutId).to.be.above(0);

                const saveReportFinishedAction = findActionByType(Actions.SAVE_REPORT_ERROR);
                expect(saveReportFinishedAction).to.be.ok();
                expect(saveReportFinishedAction.payload.saveAsNew).to.not.be.undefined();
            });
        });

        it('should GA log logVisualizationSaveFailed on first save fail', () => {
            const apiSaveReport = sinon.stub().returns(Promise.reject({}));
            const dependencies = createDependencies({
                apiSaveReport
            });

            const action = saveReport(false, dependencies);

            return dispatch(action).then(() => {
                expect(dependencies.loggerService.logVisualizationSaveFailed).to.be.calledOnce();
            });
        });

        it('should log action on error api call', () => {
            const { log, formatter, findLogEntryByMessage } = createTestLogging();
            const apiSaveReport = sinon.spy(() => Promise.reject());
            const dependencies = createDependencies({
                log, formatter, apiSaveReport
            });

            const action = saveReport(false, dependencies);
            return dispatch(action).then(() => {
                expect(
                    findLogEntryByMessage(Actions.SAVE_REPORT_ERROR)
                ).to.be.ok();
            });
        });

        it('should call MESSAGES_DELAYED_LONG_SAVING action when saving taking long time', () => {
            const clock = sinon.useFakeTimers();
            const apiSaveReport = sinon.stub().returns(Promise.resolve({}));
            const dependencies = createDependencies({
                apiSaveReport
            });

            const action = saveReport(false, dependencies);

            dispatch(action);

            const saveReportAction = findActionByType(Actions.SAVE_REPORT_STARTED);
            expect(saveReportAction).to.be.ok();
            expect(saveReportAction.payload.timeoutId).to.be.above(0);

            clock.tick(1001);

            const messagesDelayedLongSavingAction = findActionByType(Actions.MESSAGES_DELAYED_LONG_SAVING);
            expect(messagesDelayedLongSavingAction).to.be.ok();

            clock.restore();
        });
    });

    context('saveReportCheck', () => {
        const getDependencies = () => ({
            saveReportCreator: () => () => Promise.resolve()
        });

        it('should rename dialog when there is no title', () => {
            const action = saveReportCheck(false, getDependencies());

            dispatch(action);

            const renameDialogAction = findActionByType(Actions.SHOW_DIALOG_SAVING_UNTITLED_REPORT_CONFIRMATION);
            expect(renameDialogAction).to.be.ok();
        });

        it('should show rename dialog when report is "Saved as"', () => {
            const action = saveReportCheck(true, getDependencies());

            dispatch(action);

            const renameDialogAction = findActionByType(Actions.SHOW_DIALOG_SAVING_UNTITLED_REPORT_CONFIRMATION);
            expect(renameDialogAction).to.be.ok();
        });

        it('should not show rename dialog when title was already changed', () => {
            const action = saveReportCheck(true, getDependencies());

            actionStore.setState(
                actionStore
                    .getState()
                    .setIn(StatePaths.REPORT_SAVED_TITLE, 'Report Jirky Zajoca')
                    .setIn(StatePaths.REPORT_CURRENT_TITLE, 'Report Peti Benesu')
            );

            dispatch(action);

            const renameDialogAction = findActionByType(Actions.SHOW_DIALOG_SAVING_UNTITLED_REPORT_CONFIRMATION);
            expect(renameDialogAction).to.not.be.ok();
        });
    });
});

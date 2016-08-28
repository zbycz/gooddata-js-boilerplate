import * as Actions from '../constants/Actions';
import * as API from '../utils/api';
import * as ReportService from '../services/report_service';
import { getProjectId } from '../selectors/bootstrap_selector';
import { hasTitleChanged } from '../selectors/save_report_selector';
import { isReportSavedSelector } from '../selectors/report_selector';

import * as LoggerService from '../services/logger_service';
import { logger } from './log_decorator';
import { saveFormatter } from './log_formatters';

const HIDE_SUCCESS_MESSAGE_AFTER = 2500;

const hideSuccessMessage = dispatch => {
    const hideTimeoutId = setTimeout(() => {
        dispatch({
            type: Actions.SAVE_REPORT_SUCCESS_MESSAGE_HIDE,
            payload: { hideTimeoutId }
        });
    }, HIDE_SUCCESS_MESSAGE_AFTER);
};

const saveReportDependencies = {
    log: LoggerService.log,
    loggerService: LoggerService,
    formatter: saveFormatter,
    apiSaveReport: API.saveReport
};

const saveReportFinishedCreator = payload => ({
    type: Actions.SAVE_REPORT_FINISHED,
    payload
});

const saveReportErrorCreator = payload => ({
    type: Actions.SAVE_REPORT_ERROR,
    payload
});

export const saveReport = (saveAsNew, dependencies = saveReportDependencies) => (dispatch, getState) => {
    const state = getState();

    const timeoutId = setTimeout(() => {
        dispatch({ type: Actions.MESSAGES_DELAYED_LONG_SAVING });
    }, 1000);

    const startTime = Date.now();
    const { apiSaveReport, loggerService } = dependencies;

    dispatch({
        type: Actions.SAVE_REPORT_STARTED,
        payload: { timeoutId, saveAsNew }
    });

    const projectId = getProjectId(state);
    const updatedReportObject = ReportService.getNewReportMDObject(state);

    const isUpdate = isReportSavedSelector(state) && !saveAsNew;

    return apiSaveReport({
        projectId,
        reportMDObject: updatedReportObject.toJS(),
        isUpdate
    }).then(reportMDObject => {
        const time = Date.now() - startTime;
        dispatch(
            logger(dependencies, saveReportFinishedCreator)({
                reportMDObject,
                saveAsNew,
                time
            })
        );

        const logPayload = {
            saveAsNew,
            isUpdate,
            state,
            time
        };

        loggerService.logVisualizationSaved(logPayload);

        hideSuccessMessage(dispatch);
    })
    .catch(() => {
        const time = Date.now() - startTime;
        dispatch(
            logger(dependencies, saveReportErrorCreator)({
                saveAsNew,
                time
            })
        );

        const logPayload = {
            saveAsNew,
            isUpdate,
            state,
            time
        };

        loggerService.logVisualizationSaveFailed(logPayload);
    });
};

const saveReportCheckDependencies = {
    ...saveReportDependencies,
    saveReportCreator: saveReport
};

export const saveReportCheck = (saveAsNew, dependencies = saveReportCheckDependencies) => (dispatch, getState) => {
    const state = getState();
    const { saveReportCreator } = dependencies;

    if (ReportService.isReportTitleEmpty(state) || (saveAsNew && !hasTitleChanged(state))) {
        return dispatch({
            type: Actions.SHOW_DIALOG_SAVING_UNTITLED_REPORT_CONFIRMATION,
            payload: { saveAsNew }
        });
    }

    return saveReportCreator(saveAsNew)(dispatch, getState);
};

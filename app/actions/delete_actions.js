import * as Actions from '../constants/Actions';
import * as API from '../utils/api';
import * as LoggerService from '../services/logger_service';

import { logger } from './log_decorator';
import { deleteFormatter } from './log_formatters';

const HIDE_DELETE_MESSAGE_AFTER = 2500;

const deleteDependencies = {
    log: LoggerService.log,
    loggerService: LoggerService,
    formatter: deleteFormatter,
    deleteObject: API.deleteObject
};

const hideSuccessMessage = dispatch => {
    const hideTimeoutId = setTimeout(() => {
        dispatch({
            type: Actions.DELETE_REPORT_SUCCESS_MESSAGE_HIDE,
            payload: { hideTimeoutId }
        });
    }, HIDE_DELETE_MESSAGE_AFTER);
};

const deleteReportFinishedCreator = payload => ({
    type: Actions.DELETE_REPORT_FINISHED,
    payload
});

const deleteReportFailedCreator = payload => ({
    type: Actions.DELETE_REPORT_ERROR,
    payload
});

export const deleteReport = ({ report, forceDelete }, dependencies = deleteDependencies) => (dispatch, getState) => {
    if (forceDelete) {
        const startTime = Date.now();
        const state = getState();

        const { deleteObject, loggerService, log, formatter } = dependencies;

        dispatch({ type: Actions.DELETE_REPORT_STARTED, payload: report });

        const loggerDependencies = { log, formatter };

        return deleteObject(report.getIn(['meta', 'uri']))
            .then(() => {
                const time = Date.now() - startTime;
                dispatch(
                    logger(loggerDependencies, deleteReportFinishedCreator)({ time })
                );

                hideSuccessMessage(dispatch);

                loggerService.logVisualizationDeleted({
                    state,
                    time
                });
            })
            .catch(() => {
                const time = Date.now() - startTime;
                dispatch(
                    logger(loggerDependencies, deleteReportFailedCreator)({ time })
                );

                loggerService.logVisualizationDeleteFailed({
                    state,
                    time
                });
            });
    }

    // load and show where is report used
    return dispatch({ type: Actions.SHOW_DIALOG_DELETE_REPORT_CONFIRMATION, payload: report });
};

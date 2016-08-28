import { v4 as uuid } from 'node-uuid';

import * as Actions from '../constants/Actions';
import * as API from '../services/execution_service';
import { createReport } from '../models/report';

import { logger } from './log_decorator';
import { reportFormatter, exportFormatter } from './log_formatters';
import { exportReportToServer } from '../utils/api';
import { getProjectId } from '../selectors/bootstrap_selector';
import { getVisualizationForExport } from '../services/report_service';
import * as LoggerService from '../services/logger_service';
import * as StatePaths from '../constants/StatePaths';

export function reportExecutionStarted() {
    return {
        type: Actions.REPORT_EXECUTION_STARTED,
        meta: {
            startTime: Date.now(),
            id: uuid()
        }
    };
}

export function reportExecutionFinished(executedReport, execMeta) {
    return {
        type: Actions.REPORT_EXECUTION_FINISHED,
        payload: executedReport,
        meta: {
            ...execMeta,
            endTime: Date.now()
        }
    };
}

export function reportExecutionFailed(error, execMeta) {
    return {
        type: Actions.REPORT_EXECUTION_ERROR,
        payload: error,
        error: true,
        meta: {
            ...execMeta,
            endTime: Date.now()
        }
    };
}

export function dataTooLargeToDisplay() {
    return {
        type: Actions.REPORT_EXECUTION_TOO_LARGE_TO_DISPLAY,
        error: true
    };
}

const actionDependencies = {
    log: LoggerService.log,
    loggerService: LoggerService,
    reportFactory: createReport,
    execute: API.execute,
    formatter: reportFormatter
};

function executeReportPure(dependencies = actionDependencies) {
    // payload would go here
    return () => (dispatch, getState) => {
        const { reportFactory, execute, loggerService } = dependencies;

        const start = reportExecutionStarted();
        dispatch(start);

        const report = reportFactory(getState());

        return execute(report)
            .then(executedReport => {
                const state = getState();
                const firstExecution = state.getIn(StatePaths.REPORT_EXECUTION_FIRST) && !state.getIn(StatePaths.REPORT_NOW_OPEN);

                loggerService.logVisualizationExecuted({
                    state,
                    time: Date.now() - start.meta.startTime
                });

                if (firstExecution) {
                    loggerService.logFirstExecution({ state });
                }

                dispatch(reportExecutionFinished(executedReport, start.meta));
            })
            .catch(error => {
                loggerService.logVisualizationExecutionFailed({
                    state: getState(),
                    time: Date.now() - start.meta.startTime
                });
                dispatch(reportExecutionFailed(error, start.meta));
            });
    };
}

export const executeReport =
    (dependencies = actionDependencies) => (
        logger(dependencies, executeReportPure(dependencies))()
    );

const exportDependencies = {
    log: LoggerService.log,
    loggerService: LoggerService,
    makeExportRequest: exportReportToServer,
    formatter: exportFormatter,
    visualizationForExport: getVisualizationForExport
};

export function exportReport(dependencies = exportDependencies) {
    return logger(dependencies, () => (dispatch, getState) => {
        const {
            makeExportRequest,
            visualizationForExport,
            loggerService
        } = dependencies;

        const id = uuid();
        const startTime = Date.now();
        const state = getState();
        const projectId = getProjectId(state);

        dispatch({
            type: Actions.REPORT_EXPORT_STARTED,
            meta: {
                id,
                startTime,
                projectId
            }
        });

        const vizualization = visualizationForExport(state);
        const vizualizationObj = vizualization.toJSON();

        makeExportRequest(projectId, vizualizationObj)
            .then(uriResponse => {
                window.open(`/#s=/gdc/projects/${projectId}|analysisPage|${uriResponse.uri}|empty-report`);
                dispatch({
                    type: Actions.REPORT_EXPORT_FINISHED,
                    meta: {
                        id,
                        uri: uriResponse.uri,
                        startTime,
                        projectId,
                        endTime: Date.now()
                    }
                });
            })
            .catch(error => {
                dispatch({
                    type: Actions.REPORT_EXPORT_ERROR,
                    payload: error,
                    error: true,
                    meta: {
                        id,
                        projectId,
                        startTime,
                        statusCode: error.status,
                        statusText: error.statusText,
                        endTime: Date.now()
                    }
                });
            });

        loggerService.logOpenAsReport({ state });
    })(); // need to call it with no payload
}

export const reportTitleChange = title => ({
    type: Actions.REPORT_TITLE_CHANGE,
    payload: {
        title
    }
});

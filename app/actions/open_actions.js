import * as Actions from '../constants/Actions';
import { executeReport } from './report_actions';
import * as API from '../utils/api';
import { isSaveDisabledSelector } from '../selectors/save_report_selector';
import { createReportedAction } from './dnd_actions';

import { logger } from './log_decorator';
import { openFormatter } from './log_formatters';
import * as LoggerService from '../services/logger_service';

import * as ReportService from '../services/report_service';


const actionDependencies = {
    log: LoggerService.log,
    formatter: openFormatter,
    execute: executeReport,
    getObjects: API.getObjects,
    loadAdditionalData: ReportService.loadAdditionalData,
    loadAttributeElements: API.loadAttributeElementsSelection,
    loadDateDataSets: API.loadDateDataSets,
    loggerService: LoggerService
};

export const openReport = ({ report, forceOpen }, dependencies = actionDependencies) => (dispatch, getState) => {
    const state = getState();
    const isAbleToOpen = isSaveDisabledSelector(state);

    if (isAbleToOpen || forceOpen) {
        dispatch({ type: Actions.OPEN_REPORT_STARTED, payload: report });

        const {
            loadAdditionalData,
            getObjects,
            loadAttributeElements,
            loadDateDataSets,
            loggerService
        } = dependencies;
        const startTime = Date.now();

        return loadAdditionalData(report, getState, getObjects, loadAttributeElements, loadDateDataSets).then(result => {
            const time = Date.now() - startTime;
            const payload = {
                loadedItems: result,
                report,
                time
            };

            loggerService.logVisualizationOpen({
                state,
                time
            });

            dispatch(
                logger(dependencies,
                    createReportedAction(Actions.OPEN_REPORT_FINISHED)(dependencies)
                )(payload)
            );
        });
    }

    return dispatch({ type: Actions.SHOW_DIALOG_OPEN_REPORT_CONFIRMATION, payload: report });
};

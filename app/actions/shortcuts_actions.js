import * as Actions from '../constants/Actions';
import { logger } from './log_decorator';
import { createReportedAction } from './dnd_actions';
import { executeReport } from './report_actions';
import { log } from '../services/logger_service';
import { loadDateDataSets } from '../utils/api';

import { shortcutsFormatter } from './log_formatters';
import { getProjectId } from '../selectors/bootstrap_selector';
import { getReportMDObject } from '../services/measure_over_time_service';
import * as StatePaths from '../constants/StatePaths';

const actionDependencies = {
    log,
    formatter: shortcutsFormatter,
    execute: executeReport
};

export const applyAttributeShortcut =
    (item, dependencies = actionDependencies) => (
        logger(
            dependencies,
            createReportedAction(Actions.SHORTCUT_APPLY_ATTRIBUTE)(dependencies)
        )(item)
    );

export const applyMetricShortcut =
    (item, dependencies = actionDependencies) => (
        logger(
            dependencies,
            createReportedAction(Actions.SHORTCUT_APPLY_METRIC)(dependencies)
        )(item)
    );

export const applyMetricOverTimeShortcut =
    (item, dependencies = actionDependencies) => (
        logger(
            dependencies,
            createReportedAction(Actions.SHORTCUT_APPLY_METRIC_OVER_TIME)(dependencies)
        )(item)
    );

function haveDateDataSetsBeenLoaded(state) {
    return state.getIn(StatePaths.SHORTCUT_DATE_DATASETS_LOADED);
}

function isMeasureDroppedMeanwhile(state) {
    return state.getIn(StatePaths.SHORTCUT_DROPPED_ITEM);
}

export const dropCatalogueItem =
    catalogueItem => (dispatch, getState) => {
        if (haveDateDataSetsBeenLoaded(getState())) {
            return dispatch(applyMetricOverTimeShortcut(catalogueItem));
        }

        return dispatch({
            type: Actions.SHORTCUT_SET_DROPPED_ITEM,
            payload: { catalogueItem }
        });
    };

function getOptions(reportMDObject, dataSetIdentifier) {
    return { bucketItems: reportMDObject, dataSetIdentifier };
}

export const loadShortcutDateDataSets =
    () => (dispatch, getState) => {
        dispatch({ type: Actions.SHORTCUT_DATE_DATASETS_UPDATE });

        const projectId = getProjectId(getState());
        const reportMDObject = getReportMDObject(getState());
        const dataSetIdentifier = getState().getIn(StatePaths.CATALOGUE_ACTIVE_DATASET_ID) || undefined;

        return loadDateDataSets(projectId, getOptions(reportMDObject, dataSetIdentifier)).then(dateDataSets => {
            dispatch({ type: Actions.SHORTCUT_DATE_DATASETS_UPDATED, payload: dateDataSets });

            const state = getState();

            if (isMeasureDroppedMeanwhile(state)) {
                const droppedItem = state.getIn(StatePaths.SHORTCUT_DROPPED_ITEM);

                dispatch(applyMetricOverTimeShortcut(droppedItem));
            }
        });
    };

import { Iterable } from 'immutable';
import { createSelector } from 'reselect';

import * as StatePaths from '../constants/StatePaths';
import {
    ENTITY_TOO_LARGE,
    INVALID_CONFIGURATION,
    DATA_TOO_LARGE_TO_DISPLAY,
    INTERNAL_SERVER_ERROR
} from '../constants/Errors';
import { METRICS } from '../constants/bucket';
import { currentReportMDObject } from './buckets_selector';
import { getDroppedCatalogueItem } from './shortcuts_selector';

function getExecutionError(state) {
    return state.getIn(StatePaths.REPORT_EXECUTION_ERROR);
}

function getExecutionErrorStatus(state) {
    return state.getIn(StatePaths.REPORT_EXECUTION_ERROR_STATUS);
}

export const isReportSavedSelector = state => !!state.getIn(StatePaths.REPORT_SAVED_URI);

function isComputingShortcutSelector(state) {
    return !!getDroppedCatalogueItem(state);
}

export const lastSavedReportSelector = state => state.getIn(StatePaths.REPORT_LAST_SAVED_OBJECT_DATA);

export const isExecutionRunningSelector =
    state => state.getIn(StatePaths.REPORT_EXECUTION_RUNNING);

export const dataSelector = createSelector(
    state => state.getIn(StatePaths.REPORT_EXECUTION_DATA),

    data => (Iterable.isIterable(data) ? data.toJS() : null)
);

export const isDataTooLargeToComputeSelector = createSelector(
    getExecutionError,
    error => !!error && error.get('status') === ENTITY_TOO_LARGE
);

export const isDataTooLargeToDisplaySelector = createSelector(
    getExecutionError,
    error => !!error && error.get('status') === DATA_TOO_LARGE_TO_DISPLAY
);

export const isReportTooLargeSelector = createSelector(
    isDataTooLargeToComputeSelector,
    isDataTooLargeToDisplaySelector,
    (isDataTooLargeToCompute, isDataTooLargeToDisplay) => (isDataTooLargeToCompute || isDataTooLargeToDisplay)
);

export const isInvalidConfigurationSelector = createSelector(
    getExecutionErrorStatus,
    status => (status === INVALID_CONFIGURATION || status === INTERNAL_SERVER_ERROR)
);

export const isReportEmptySelector =
    state => state.getIn(StatePaths.REPORT_EXECUTION_DATA_EMPTY);

const isReportExecutedSelector = createSelector(
    dataSelector,
    isDataTooLargeToComputeSelector,
    isExecutionRunningSelector,

    (data, isDataTooLargeToCompute, isExecutionRunning) =>
        (!!data || isDataTooLargeToCompute || isExecutionRunning)
);

export const isReportMissingMetric = createSelector(
    state => state.getIn(StatePaths.VISUALIZATION_TYPE),
    state => state.getIn(StatePaths.BUCKETS),
    isReportExecutedSelector,

    (visualizationType, buckets, isReportExecuted) =>
        visualizationType !== 'table' && buckets.getIn([METRICS, 'items']).size === 0 && isReportExecuted
);

export const isReportValid = createSelector(
    dataSelector,
    isReportTooLargeSelector,
    isInvalidConfigurationSelector,
    isReportEmptySelector,
    isReportMissingMetric,

    (data, isReportTooLarge, isInvalidConfiguration, isReportEmpty, isMissingMetric) =>
        !!data && !isReportTooLarge && !isInvalidConfiguration && !isReportEmpty && !isMissingMetric
);

export const shouldExecuteReportOnFilterChange = createSelector(
    isReportExecutedSelector,
    isInvalidConfigurationSelector,
    isReportMissingMetric,

    (isReportExecuted, isInvalidConfiguration, isMissingMetric) =>
        (isReportExecuted || isInvalidConfiguration) && !isMissingMetric
);

export default createSelector(
    isExecutionRunningSelector,
    currentReportMDObject,
    dataSelector,
    isReportTooLargeSelector,
    isInvalidConfigurationSelector,
    isReportEmptySelector,
    isReportMissingMetric,
    isComputingShortcutSelector,

    (isExecutionRunning, config, data, isReportTooLarge, isInvalidConfiguration, isReportEmpty, isMissingMetric, isComputingShortcut) =>
        ({
            isExecutionRunning,
            config,
            data,
            isReportTooLarge,
            isInvalidConfiguration,
            isReportEmpty,
            isMissingMetric,
            isComputingShortcut
        })
);

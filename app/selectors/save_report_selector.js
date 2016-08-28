import {
    REPORT_SAVING,
    REPORT_EXECUTION_DATA,
    REPORT_CONTENT,
    REPORT_SAVED_TITLE,
    REPORT_CURRENT_TITLE,
    REPORT_SAVING_AS_NEW
} from '../constants/StatePaths';
import { is, fromJS } from 'immutable';
import { createSelector } from 'reselect';
import { currentReportMDObject } from '../selectors/buckets_selector';
import {
    isInvalidConfigurationSelector,
    isReportEmptySelector,
    isReportMissingMetric,
    isReportTooLargeSelector
} from '../selectors/report_selector';

const isSavingSelector = state => state.getIn(REPORT_SAVING);
const isSavingAsNewSelector = state => state.getIn(REPORT_SAVING_AS_NEW);
const isSavedReportCurrentReport = state => {
    const savedReportContent = state.getIn(REPORT_CONTENT);
    const currentReportContent = fromJS(currentReportMDObject(state));

    return is(savedReportContent, currentReportContent);
};

export const hasTitleChanged = state =>
    state.getIn(REPORT_SAVED_TITLE) !== state.getIn(REPORT_CURRENT_TITLE);

export const hasExecutionDataSelector = state => !!state.getIn(REPORT_EXECUTION_DATA);

export const savingInProgressSelector = state => isSavingSelector(state) || isSavingAsNewSelector(state);

export const reportCanBeSaved = state => {
    return !isReportMissingMetric(state) &&
    (
        hasExecutionDataSelector(state) ||
        isInvalidConfigurationSelector(state) ||
        isReportEmptySelector(state) ||
        isReportTooLargeSelector(state)
    );
};

export const isCurrentWithUnchangedTitle = state =>
    isSavedReportCurrentReport(state) && !hasTitleChanged(state);

export const isSaveDisabledSelector = state =>
   !reportCanBeSaved(state) ||
   savingInProgressSelector(state) ||
   isCurrentWithUnchangedTitle(state);

export const isSaveAsNewDisabledSelector = state =>
    !reportCanBeSaved(state) ||
    savingInProgressSelector(state);

export const saveReportSelector = createSelector(
    isSavingSelector,
    isSaveDisabledSelector,

    (isSaving, isDisabled) => ({
        isSaving,
        isDisabled
    })
);

export const saveAsNewReportSelector = createSelector(
    isSavingAsNewSelector,
    isSaveAsNewDisabledSelector,

    (isSaving, isDisabled) => ({
        isSaving,
        isDisabled
    })
);

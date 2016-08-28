import { REPORT_OPENING, REPORT_SAVING } from '../constants/StatePaths';
import { createSelector } from 'reselect';

export const isReportOpeningSelector = state => state.getIn(REPORT_OPENING);

export const isReportSavingSelector = state => state.getIn(REPORT_SAVING);

export const canOpenReport = createSelector(
    isReportOpeningSelector,
    isReportSavingSelector,

    (isReportOpening, isReportSaving) =>
        (!isReportOpening && !isReportSaving)
);

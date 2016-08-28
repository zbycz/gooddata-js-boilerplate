import { createSelector } from 'reselect';
import * as StatePaths from '../constants/StatePaths';

export const currentReportTitle = state => state.getIn(StatePaths.REPORT_CURRENT_TITLE);
export const hasDefinedTitle = state => state.getIn(StatePaths.REPORT_CURRENT_TITLE) !== '';

export default createSelector(
    currentReportTitle,
    hasDefinedTitle,

    (currentTitle, isTitleDefined) => ({
        currentTitle,
        isTitleDefined
    })
);

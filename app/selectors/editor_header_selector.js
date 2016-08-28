import { createSelector } from 'reselect';
import * as StatePaths from '../constants/StatePaths';
import { isCsvUploaderEnabled, getIsEmbedded } from './bootstrap_selector';

import { isSaveDisabledSelector } from './save_report_selector';
import { isResetDisabledSelector } from './reset_button_selector';
import { isReportSavedSelector } from '../selectors/report_selector';

export const undoPossible = state => state.getIn(StatePaths.UNDO_POSSIBLE);
export const redoPossible = state => state.getIn(StatePaths.REDO_POSSIBLE);
export const reportSaving = state => state.getIn(StatePaths.REPORT_SAVING);
export const currentReportTitle = state => state.getIn(StatePaths.REPORT_CURRENT_TITLE);

export default createSelector(
    undoPossible,
    redoPossible,
    isResetDisabledSelector,
    reportSaving,
    isSaveDisabledSelector,
    isCsvUploaderEnabled,
    isReportSavedSelector,
    getIsEmbedded,

    (isUndoPossible, isRedoPossible, isResetDisabled, isReportSaving, isSaveDisabled, isTitleDisabled, isReportSaved, isEmbedded) => {
        return ({
            isUndoDisabled: !isUndoPossible || isReportSaving,
            isRedoDisabled: !isRedoPossible || isReportSaving,
            isResetDisabled: isResetDisabled || isReportSaving,
            isSaveDisabled,
            isTitleDisabled,
            isReportSaved,
            isEmbedded
        });
    }
);

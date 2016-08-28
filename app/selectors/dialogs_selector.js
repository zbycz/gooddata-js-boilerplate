import * as StatePaths from '../constants/StatePaths';
import { createSelector } from 'reselect';
import * as ReportService from '../services/report_service';

const getOpenReportDialog = state => state.getIn(StatePaths.DIALOGS_OPEN_REPORT_CONFIRMATION);
const getDeleteReportDialog = state => state.getIn(StatePaths.DIALOGS_DELETE_REPORT_CONFIRMATION);
const getSavingUntitledReportDialog = state => state.getIn(StatePaths.DIALOGS_SAVING_UNTITLED_REPORT_CONFIRMATION);
const getReportTitle = state => ReportService.getReportTitle(state);
const getDeletedReportTitle = state => state.getIn(StatePaths.DIALOGS_DELETE_REPORT_CONFIRMATION_DATA_TITLE);

export const dialogsSelector = createSelector(
    getOpenReportDialog,
    getDeleteReportDialog,
    getSavingUntitledReportDialog,
    getReportTitle,
    getDeletedReportTitle,

    (openReportDialog, deleteReportDialog, savingUntitledReportDialog, reportTitle, deletedReportTitle) =>
        ({ openReportDialog, deleteReportDialog, savingUntitledReportDialog, reportTitle, deletedReportTitle })
);

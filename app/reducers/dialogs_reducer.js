import * as Actions from '../constants/Actions';
import * as StatePaths from '../constants/StatePaths';
import { hideAllDialogs } from '../services/dialogs_service';
import { fromJS } from 'immutable';

const dialogHide = hideAllDialogs;

const showDialogOpenReportConfirmation = (state, action) => state
    .setIn(StatePaths.DIALOGS_OPEN_REPORT_CONFIRMATION_ACTIVE, true)
    .setIn(StatePaths.DIALOGS_OPEN_REPORT_CONFIRMATION_DATA, action.payload);

const showDialogDeleteReportConfirmation = (state, action) => state
    .setIn(StatePaths.DIALOGS_DELETE_REPORT_CONFIRMATION_ACTIVE, true)
    .setIn(StatePaths.DIALOGS_DELETE_REPORT_CONFIRMATION_DATA, action.payload);

const showDialogSavingUntitledReport = (state, action) => state
    .setIn(StatePaths.DIALOGS_SAVING_UNTITLED_REPORT_CONFIRMATION_ACTIVE, true)
    .setIn(StatePaths.DIALOGS_SAVING_UNTITLED_REPORT_CONFIRMATION_DATA, fromJS(action.payload));

export default (state, action) => {
    switch (action.type) {
        case Actions.OPEN_REPORT_STARTED:
            return dialogHide(state, action);
        case Actions.DIALOG_HIDE:
            return dialogHide(state, action);
        case Actions.SHOW_DIALOG_OPEN_REPORT_CONFIRMATION:
            return showDialogOpenReportConfirmation(state, action);
        case Actions.SHOW_DIALOG_SAVING_UNTITLED_REPORT_CONFIRMATION:
            return showDialogSavingUntitledReport(state, action);
        case Actions.SHOW_DIALOG_DELETE_REPORT_CONFIRMATION:
            return showDialogDeleteReportConfirmation(state, action);

        default:
            return state;
    }
};

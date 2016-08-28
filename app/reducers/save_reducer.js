import * as Actions from '../constants/Actions';
import * as StatePaths from '../constants/StatePaths';
import { fromJS } from 'immutable';

const getSavingFlagPath = action => {
    const saveAsNew = action.payload.saveAsNew;
    return saveAsNew ? StatePaths.REPORT_SAVING_AS_NEW : StatePaths.REPORT_SAVING;
};

const saveReportStarted = (state, action) => {
    return state.setIn(getSavingFlagPath(action), true);
};

const saveReportFinished = (state, action) => {
    const { reportMDObject } = action.payload;

    return state
        .setIn(getSavingFlagPath(action), false)
        .setIn(StatePaths.REPORT_LAST_SAVED_OBJECT, fromJS(reportMDObject));
};

const saveReportError = (state, action) => state.setIn(getSavingFlagPath(action), false);

export default (state, action) => {
    switch (action.type) {
        case Actions.SAVE_REPORT_STARTED:
            return saveReportStarted(state, action);
        case Actions.SAVE_REPORT_FINISHED:
            return saveReportFinished(state, action);
        case Actions.SAVE_REPORT_ERROR:
            return saveReportError(state, action);

        default:
            return state;
    }
};

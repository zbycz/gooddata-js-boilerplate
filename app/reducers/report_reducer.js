import * as Actions from '../constants/Actions';
import * as StatePaths from '../constants/StatePaths';
import { DATA_TOO_LARGE_TO_DISPLAY } from '../constants/Errors';
import { fromJS } from 'immutable';
import { partial } from 'lodash';
import { replaceDateDataSetTitle } from '../services/execution_service';

import { updateHistory } from './time_travel_reducer';

function startReportExecution(state, action) {
    return state.setIn(StatePaths.REPORT_EXECUTION_RUNNING, true)
        .setIn(StatePaths.REPORT_EXECUTION_ID, action.meta.id)
        .deleteIn(StatePaths.REPORT_EXECUTION_DATA)
        .deleteIn(StatePaths.REPORT_EXECUTION_ERROR);
}

const isMatchingExecution = (action, state) => state.getIn(StatePaths.REPORT_EXECUTION_ID) === action.meta.id;

const setExecutionError = (action, state) => {
    return state.setIn(StatePaths.REPORT_EXECUTION_ERROR, fromJS({ status: action.payload.status }))
        .setIn(StatePaths.REPORT_EXECUTION_RUNNING, false);
};

function errorReportExecution(state, action) {
    if (isMatchingExecution(action, state)) {
        return setExecutionError(action, state);
    }

    updateHistory(partial(setExecutionError, action), partial(isMatchingExecution, action));

    return state;
}

function reportTooLargeToDisplay(state) {
    return setExecutionError({
        payload: {
            status: DATA_TOO_LARGE_TO_DISPLAY
        }
    }, state);
}

const update = (action, state) => {
    const dateDataSets = state.getIn(StatePaths.DATE_DATASETS_AVAILABLE).toJS();
    const identifiers = dateDataSets.map(dataSet => dataSet.identifier);

    return state
        .setIn(StatePaths.REPORT_EXECUTION_RUNNING, false)
        .setIn(StatePaths.REPORT_EXECUTION_FIRST, state.getIn(StatePaths.REPORT_NOW_OPEN, false))
        .setIn(StatePaths.REPORT_NOW_OPEN, false)
        .setIn(
            StatePaths.REPORT_EXECUTION_DATA,
            fromJS(replaceDateDataSetTitle(action.payload, identifiers))
        );
};

function finishReportExecution(state, action) {
    if (isMatchingExecution(action, state)) {
        return update(action, state);
    }

    updateHistory(partial(update, action), partial(isMatchingExecution, action));

    return state;
}

const reportTitleChanged = (state, action) => state.setIn(StatePaths.REPORT_CURRENT_TITLE, action.payload.title);

export default function reportReducer(state, action) {
    switch (action.type) {
        case Actions.REPORT_EXECUTION_STARTED:
            return startReportExecution(state, action);
        case Actions.REPORT_EXECUTION_ERROR:
            return errorReportExecution(state, action);
        case Actions.REPORT_EXECUTION_FINISHED:
            return finishReportExecution(state, action);
        case Actions.REPORT_TITLE_CHANGE:
            return reportTitleChanged(state, action);
        case Actions.REPORT_EXECUTION_TOO_LARGE_TO_DISPLAY:
            return reportTooLargeToDisplay(state, action);
        default:
            return state;
    }
}

import { partial } from 'lodash';
import * as Actions from '../constants/Actions';
import * as StatePaths from '../constants/StatePaths';

import { resetApplication } from './app_context_reducers';
import { updateHistory } from './time_travel_reducer';

import initialState from './initial_state';

const updateDeleted = state =>
    state.setIn(
        StatePaths.REPORT_LAST_SAVED_OBJECT,
        initialState.getIn(StatePaths.REPORT_LAST_SAVED_OBJECT)
    );

const whereDeleted = (uri, state) => state.getIn(StatePaths.REPORT_SAVED_URI) === uri;

const deleteStarted = (state, action) => {
    const reportData = action.payload;
    const deletingUri = reportData && reportData.getIn(['meta', 'uri']);
    const isDeletingLastSavedReportModified = deletingUri && state.getIn(StatePaths.REPORT_SAVED_URI) === deletingUri;
    const updatedState = state.setIn(StatePaths.DIALOGS_DELETE_REPORT_CONFIRMATION_ACTIVE, false);

    updateHistory(updateDeleted, partial(whereDeleted, deletingUri));

    if (isDeletingLastSavedReportModified) {
        return resetApplication(updatedState);
    }

    return updatedState;
};

export default (state, action) => {
    switch (action.type) {
        case Actions.DELETE_REPORT_STARTED:
            return deleteStarted(state, action);

        default:
            return state;
    }
};

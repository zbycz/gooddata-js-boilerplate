import InitialState from '../reducers/initial_state';
import * as StatePaths from '../constants/StatePaths';

export const hideAllDialogs = state => state
    .setIn(StatePaths.DIALOGS, InitialState.getIn(StatePaths.DIALOGS));

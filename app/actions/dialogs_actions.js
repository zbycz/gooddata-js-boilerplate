import * as Actions from '../constants/Actions';

export const hideDialog = payload => dispatch => {
    dispatch({ type: Actions.DIALOG_HIDE, payload });
};

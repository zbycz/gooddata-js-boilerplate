import { hideDialog } from '../dialogs_actions';
import * as Actions from '../../constants/Actions';

import { createActionStore } from '../../utils/test_action_store';

describe('DialogsActions', () => {
    let dispatch, findActionByType;

    beforeEach(() => {
        const actionStore = createActionStore();
        dispatch = actionStore.dispatch;
        findActionByType = actionStore.findActionByType;
    });

    it('should call DIALOG_HIDE action on hideDialog', () => {
        let action = hideDialog();

        dispatch(action);

        const hideDialogAction = findActionByType(Actions.DIALOG_HIDE);

        expect(hideDialogAction).to.be.ok();
    });
});

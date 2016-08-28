import { hideMessage } from '../messages_actions';
import * as Actions from '../../constants/Actions';

import { createActionStore } from '../../utils/test_action_store';

describe('MessagesActions', () => {
    let dispatch, findActionByType;

    beforeEach(() => {
        const actionStore = createActionStore();
        dispatch = actionStore.dispatch;
        findActionByType = actionStore.findActionByType;
    });

    describe('hideMessage', () => {
        it('should call HIDE_MESSAGE action with messageId on hideMessage', () => {
            const messageId = 123;
            let action = hideMessage(messageId);

            dispatch(action);

            const hideMessageAction = findActionByType(Actions.HIDE_MESSAGE);

            expect(hideMessageAction).to.be.ok();
            expect(hideMessageAction.payload.messageId).to.eql(messageId);
        });
    });
});

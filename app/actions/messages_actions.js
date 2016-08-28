import * as Actions from '../constants/Actions';

export function hideMessage(messageId) {
    return { type: Actions.HIDE_MESSAGE, payload: { messageId } };
}

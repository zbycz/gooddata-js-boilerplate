import * as StatePaths from '../constants/StatePaths';
import Message from '../models/message';

export const MESSAGE_SAVE_REPORT_ERROR = 'save_report_error';
export const MESSAGE_SAVE_REPORT_SUCCESS = 'save_report_success';
export const MESSAGE_DELETE_REPORT_ERROR = 'delete_report_error';
export const MESSAGE_LONG_SAVING = 'long_saving';
export const MESSAGE_DELETE_REPORT_SUCCESS = 'delete_report_success';

export function createMessage(state, messageId, messageConfiguration) {
    const { messageData, timeoutId, delayed = false } = messageConfiguration;

    const message = new Message({
        id: messageId,
        type: messageData.type,
        text: messageData.text
    });

    if (delayed) {
        return state.setIn(StatePaths.MESSAGES_DELAYED,
            state.getIn(StatePaths.MESSAGES_DELAYED).push(
                message.set('timeoutId', timeoutId)
            )
        );
    }

    return state.setIn(StatePaths.MESSAGES_DISPLAYED,
        state.getIn(StatePaths.MESSAGES_DISPLAYED).push(message)
    );
}

export function removeMessage(state, messageId) {
    return state.withMutations(mutableState =>
        mutableState
            .setIn(StatePaths.MESSAGES_DELAYED,
                mutableState.getIn(StatePaths.MESSAGES_DELAYED).filter(message => {
                    if (message.get('id') === messageId) {
                        clearTimeout(message.get('timeoutId'));
                        return false;
                    }
                    return true;
                })
            )
            .setIn(StatePaths.MESSAGES_DISPLAYED,
                mutableState.getIn(StatePaths.MESSAGES_DISPLAYED).filter(message => message.get('id') !== messageId)
            )
    );
}

export function showDelayedMessage(state, messageId) {
    const delayedMessage = state.getIn(StatePaths.MESSAGES_DELAYED).find(message => message.get('id') === messageId);

    const updatedState = state.setIn(StatePaths.MESSAGES_DELAYED,
        state.getIn(StatePaths.MESSAGES_DELAYED).filter(message => message.get('id') !== messageId)
    );

    return updatedState.setIn(StatePaths.MESSAGES_DISPLAYED,
        updatedState.getIn(StatePaths.MESSAGES_DISPLAYED).push(delayedMessage.delete('timeoutId'))
    );
}

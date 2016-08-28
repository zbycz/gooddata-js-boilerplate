import * as Actions from '../constants/Actions';
import * as MessagesService from '../services/messages_service.js';

const saveReportError = state => {
    const newMessage = {
        type: 'error',
        text: 'messages.saveReportError'
    };

    return MessagesService.createMessage(
        MessagesService.removeMessage(state, MessagesService.MESSAGE_LONG_SAVING),
        MessagesService.MESSAGE_SAVE_REPORT_ERROR, {
            messageData: newMessage
        }
    );
};

const deleteReportStarted = state =>
    MessagesService.removeMessage(state, MessagesService.MESSAGE_DELETE_REPORT_ERROR);

const deleteReportError = state => {
    const newMessage = {
        type: 'error',
        text: 'messages.deleteReportError'
    };

    return MessagesService.createMessage(state, MessagesService.MESSAGE_DELETE_REPORT_ERROR, {
        messageData: newMessage
    });
};

const deleteReportFinished = state =>
    MessagesService.createMessage(state, MessagesService.MESSAGE_DELETE_REPORT_SUCCESS, {
        messageData: {
            type: 'success',
            text: 'messages.deleteReportSuccess'
        }
    });

const saveReportFinished = state => {
    const removedLongSaving = MessagesService.removeMessage(
        state,
        MessagesService.MESSAGE_LONG_SAVING
    );
    const removedPreviousSaved = MessagesService.removeMessage(
        removedLongSaving,
        MessagesService.MESSAGE_SAVE_REPORT_SUCCESS
    );

    return MessagesService.createMessage(
        removedPreviousSaved,
        MessagesService.MESSAGE_SAVE_REPORT_SUCCESS,
        {
            messageData: {
                type: 'success',
                text: 'messages.saveReportSuccess'
            }
        }
    );
};

const saveReportStarted = (state, action = {}) => {
    const updatedState = MessagesService.createMessage(state, MessagesService.MESSAGE_LONG_SAVING, {
        messageData: {
            type: 'progress',
            text: 'messages.longSaving'
        },
        delayed: true,
        timeoutId: action.payload.timeoutId
    });

    return MessagesService.removeMessage(updatedState, MessagesService.MESSAGE_SAVE_REPORT_ERROR);
};

const hideMessage = (state, action) => {
    const { messageId } = action.payload;

    return MessagesService.removeMessage(state, messageId);
};

const messagesDelayedLongSaving = state =>
    MessagesService.showDelayedMessage(state, MessagesService.MESSAGE_LONG_SAVING);

const saveReportSuccessMessageHide = state =>
    MessagesService.removeMessage(state, MessagesService.MESSAGE_SAVE_REPORT_SUCCESS);

const deleteReportSuccessMessageHide = state =>
    MessagesService.removeMessage(state, MessagesService.MESSAGE_DELETE_REPORT_SUCCESS);

export default (state, action) => {
    switch (action.type) {
        case Actions.SAVE_REPORT_ERROR:
            return saveReportError(state, action);
        case Actions.DELETE_REPORT_STARTED:
            return deleteReportStarted(state, action);
        case Actions.DELETE_REPORT_FINISHED:
            return deleteReportFinished(state, action);
        case Actions.DELETE_REPORT_ERROR:
            return deleteReportError(state, action);
        case Actions.HIDE_MESSAGE:
            return hideMessage(state, action);
        case Actions.SAVE_REPORT_STARTED:
            return saveReportStarted(state, action);
        case Actions.MESSAGES_DELAYED_LONG_SAVING:
            return messagesDelayedLongSaving(state, action);
        case Actions.SAVE_REPORT_FINISHED:
            return saveReportFinished(state, action);
        case Actions.SAVE_REPORT_SUCCESS_MESSAGE_HIDE:
            return saveReportSuccessMessageHide(state, action);
        case Actions.DELETE_REPORT_SUCCESS_MESSAGE_HIDE:
            return deleteReportSuccessMessageHide(state, action);

        default:
            return state;
    }
};

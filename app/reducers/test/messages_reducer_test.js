import * as ActionTypes from '../../constants/Actions';

import messagesReducer from '../messages_reducer';
import initialState from '../../reducers/initial_state';

const MESSAGE_LONG_SAVING = 'long_saving';
const MESSAGE_SAVE_REPORT_ERROR = 'save_error';
const MESSAGE_SAVE_REPORT_SUCCESS = 'save_success';

describe('messagesReducer', () => {
    const MSG_ID = 'msgId';
    const TIMEOUT_ID = 'toId';
    let MessageServiceMock;

    beforeEach(() => {
        MessageServiceMock = {
            MESSAGE_LONG_SAVING,
            MESSAGE_SAVE_REPORT_ERROR,
            removeMessage: sinon.spy(),
            createMessage: sinon.spy(),
            showDelayedMessage: sinon.spy()
        };

        messagesReducer.__Rewire__('MessagesService', MessageServiceMock);
    });

    describe(`#${ActionTypes.SAVE_REPORT_ERROR}`, () => {
        it(`shall call removeMessage('${MESSAGE_LONG_SAVING}') and createMessage('${MESSAGE_SAVE_REPORT_ERROR}')`, () => {
            messagesReducer(initialState, { type: ActionTypes.SAVE_REPORT_ERROR });

            expect(MessageServiceMock.removeMessage).to.be.calledOnce();
            expect(MessageServiceMock.MESSAGE_LONG_SAVING).to.eql(MessageServiceMock.removeMessage.args[0][1]);
            expect(MessageServiceMock.createMessage).to.be.calledOnce();
            expect(MessageServiceMock.MESSAGE_SAVE_REPORT_ERROR).to.eql(MessageServiceMock.createMessage.args[0][1]);
            expect({ messageData: { type: 'error', text: 'messages.saveReportError' } }).to.eql(MessageServiceMock.createMessage.args[0][2]);
        });
    });

    describe(`#${ActionTypes.HIDE_MESSAGE}`, () => {
        it('shall call removeMessage(\'msgId\')', () => {
            messagesReducer(initialState, { type: ActionTypes.HIDE_MESSAGE, payload: { messageId: MSG_ID } });

            expect(MessageServiceMock.removeMessage).to.be.calledOnce();
            expect(MSG_ID).to.eql(MessageServiceMock.removeMessage.args[0][1]);
        });
    });

    describe(`#${ActionTypes.SAVE_REPORT_STARTED}`, () => {
        it(`shall call createMessage (delayed) and removeMessage('${MESSAGE_LONG_SAVING}')`, () => {
            messagesReducer(initialState, { type: ActionTypes.SAVE_REPORT_STARTED, payload: { timeoutId: TIMEOUT_ID } });

            const expectedCreateSpyPayload = {
                messageData: {
                    type: 'progress',
                    text: 'messages.longSaving'
                },
                delayed: true,
                timeoutId: TIMEOUT_ID
            };

            expect(MessageServiceMock.createMessage).to.be.calledOnce();
            expect(MessageServiceMock.MESSAGE_LONG_SAVING).to.eql(MessageServiceMock.createMessage.args[0][1]);
            expect(expectedCreateSpyPayload).to.eql(MessageServiceMock.createMessage.args[0][2]);
            expect(MessageServiceMock.removeMessage).to.be.calledOnce();
            expect(MessageServiceMock.MESSAGE_SAVE_REPORT_ERROR).to.eql(MessageServiceMock.removeMessage.args[0][1]);
        });
    });

    describe(`#${ActionTypes.MESSAGES_DELAYED_LONG_SAVING}`, () => {
        it(`shall call showDelayedMessage('${MESSAGE_LONG_SAVING}')`, () => {
            const stateWithDelayedMessage = messagesReducer(initialState, { type: ActionTypes.SAVE_REPORT_STARTED, payload: { timeoutId: TIMEOUT_ID } });
            messagesReducer(stateWithDelayedMessage, { type: ActionTypes.MESSAGES_DELAYED_LONG_SAVING });

            expect(MessageServiceMock.showDelayedMessage).to.be.calledOnce();
        });
    });

    describe(`#${ActionTypes.SAVE_REPORT_FINISHED}`, () => {
        it(`shall call removeMessage('${MESSAGE_LONG_SAVING}')
            and removeMessage('${MESSAGE_SAVE_REPORT_SUCCESS}')`, () => {
            messagesReducer(initialState, { type: ActionTypes.SAVE_REPORT_FINISHED });

            expect(MessageServiceMock.removeMessage).to.be.calledTwice();
            expect(MessageServiceMock.MESSAGE_LONG_SAVING).to.eql(MessageServiceMock.removeMessage.args[0][1]);
            expect(MessageServiceMock.MESSAGE_SAVE_REPORT_SUCCESS).to.eql(MessageServiceMock.removeMessage.args[1][1]);
        });
    });
});

import * as StatePaths from '../../constants/StatePaths';
import * as MessagesService from '../messages_service';
import initialState from '../../reducers/initial_state';

describe('Messages service', () => {
    const message = { type: 'error', text: 'ErrorText' };
    const addedMessage = { type: 'info', text: 'InfoText' };

    const withDisplayed = MessagesService.createMessage(initialState, 'displayed1', {
        messageData: message
    });

    const withDelayed = MessagesService.createMessage(initialState, 'delayed1', {
        messageData: message,
        delayed: true
    });

    const getMessageCore = (messages, index) => {
        const messageAtIndex = messages.get(index).toJS();
        return {
            type: messageAtIndex.type,
            text: messageAtIndex.text
        };
    };

    describe('createMessage', () => {
        context('displayedMessage', () => {
            it('should create displayed message', () => {
                const displayed = withDisplayed.getIn(StatePaths.MESSAGES_DISPLAYED);

                expect(displayed.count()).to.equal(1);
                expect(getMessageCore(displayed, 0)).to.eql(message);
            });

            it('should not create delayed message', () => {
                expect(withDisplayed.getIn(StatePaths.MESSAGES_DELAYED).count()).to.equal(0);
            });

            it('should add message if some messages already there', () => {
                const withAdded = MessagesService.createMessage(withDisplayed, 'displayed2', {
                    messageData: addedMessage
                });

                const displayed = withAdded.getIn(StatePaths.MESSAGES_DISPLAYED);

                expect(displayed.count()).to.equal(2);
                expect(getMessageCore(displayed, 0)).to.eql(message);
                expect(getMessageCore(displayed, 1)).to.eql(addedMessage);
            });
        });

        context('delayedMessage', () => {
            it('should create delayed message', () => {
                const delayed = withDelayed.getIn(StatePaths.MESSAGES_DELAYED);

                expect(delayed.count()).to.equal(1);
                expect(getMessageCore(delayed, 0)).to.eql(message);
            });

            it('should not create displayed message', () => {
                expect(withDelayed.getIn(StatePaths.MESSAGES_DISPLAYED).count()).to.equal(0);
            });

            it('should add message if some messages already there', () => {
                const withAdded = MessagesService.createMessage(withDelayed, 'delayed2', {
                    messageData: addedMessage,
                    delayed: true
                });

                const delayed = withAdded.getIn(StatePaths.MESSAGES_DELAYED);

                expect(delayed.count()).to.equal(2);

                expect(getMessageCore(delayed, 0)).to.eql(message);
                expect(getMessageCore(delayed, 1)).to.eql(addedMessage);
            });

            it('should add displayed message aside delayed', () => {
                const withAdded = MessagesService.createMessage(withDelayed, 'displayed2', {
                    messageData: addedMessage
                });

                const displayed = withAdded.getIn(StatePaths.MESSAGES_DISPLAYED);
                const delayed = withAdded.getIn(StatePaths.MESSAGES_DELAYED);

                expect(displayed.count()).to.equal(1);
                expect(delayed.count()).to.equal(1);

                expect(getMessageCore(delayed, 0)).to.eql(message);
                expect(getMessageCore(displayed, 0)).to.eql(addedMessage);
            });
        });
    });

    describe('removeMessage', () => {
        context('displayedMessage', () => {
            const withRemoved = MessagesService.removeMessage(withDisplayed, 'displayed1');

            it('should remove displayed message', () => {
                expect(withRemoved.getIn(StatePaths.MESSAGES_DISPLAYED).count()).to.equal(0);
            });
        });

        context('delayedMessage', () => {
            const withRemoved = MessagesService.removeMessage(withDelayed, 'delayed1');

            it('should remove delayed message', () => {
                expect(withRemoved.getIn(StatePaths.MESSAGES_DELAYED).count()).to.equal(0);
            });
        });
    });

    describe('showDelayedMessage', () => {
        it('should show delayed message by moving it from delayed to displayed', () => {
            const shown = MessagesService.showDelayedMessage(withDelayed, 'delayed1');
            const displayed = shown.getIn(StatePaths.MESSAGES_DISPLAYED);
            const delayed = shown.getIn(StatePaths.MESSAGES_DELAYED);

            expect(displayed.count()).to.equal(1);
            expect(delayed.count()).to.equal(0);

            expect(getMessageCore(displayed, 0)).to.eql(message);
        });
    });
});

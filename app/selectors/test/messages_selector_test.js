import { fromJS } from 'immutable';
import displayedMessages, {
     displayedMessagesSelector
} from '../messages_selector';

import * as StatePaths from '../../constants/StatePaths';
import initialState from '../../reducers/initial_state';

describe('displayedMessagesSelector', () => {
    const translatedSuffix = '_translated';
    let translate;

    beforeEach(() => {
        translate = text => `${text}${translatedSuffix}`;

        displayedMessages.__Rewire__('t', translate);
    });

    it('should display no messages in the initial state', () => {
        expect(displayedMessagesSelector(initialState).messages).to.eql([]);
    });

    it('should correctly get displayed messages with translations', () => {
        const messageText = 'messageText';
        const messageTextTranslated = translate(messageText);

        const messageCore = {
            id: 1,
            type: 'error'
        };

        const messages = [{
            ...messageCore,
            text: messageText
        }];
        const messagesTranslated = [{
            ...messageCore,
            text: messageTextTranslated
        }];

        const withMessage = initialState.setIn(StatePaths.MESSAGES_DISPLAYED,
            fromJS(messages));

        expect(displayedMessagesSelector(withMessage).messages).to.eql(messagesTranslated);
    });
});

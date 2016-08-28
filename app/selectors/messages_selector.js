import * as StatePaths from '../constants/StatePaths';

import { t } from '../utils/translations';
import { translation } from 'js-utils';

export const displayedMessagesSelector = state => {
    const messages = state.getIn(StatePaths.MESSAGES_DISPLAYED);
    return {
        messages: translation.translateProperties(messages, t, 'text')
    };
};

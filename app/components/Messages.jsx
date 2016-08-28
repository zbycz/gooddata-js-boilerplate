import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import ReactMessages from 'goodstrap/packages/Messages/ReactMessages';
import * as MessagesActions from '../actions/messages_actions';

import { displayedMessagesSelector } from '../selectors/messages_selector';

export class Messages extends Component {
    static propTypes = {
        hideMessage: PropTypes.func,
        messages: PropTypes.array
    };

    static defaultProps = {
        hideMessage: () => {},
        messages: []
    };

    render() {
        return (
            <ReactMessages
                onMessageClose={this.props.hideMessage}
                messages={this.props.messages}
            />
        );
    }
}

export default connect(displayedMessagesSelector, MessagesActions)(Messages);

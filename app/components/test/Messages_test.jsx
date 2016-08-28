import React from 'react';
import withRedux from '../../utils/with_redux';
import { Messages } from '../Messages';

import ReactTestUtils from 'react-addons-test-utils';
let {
    renderIntoDocument,
    Simulate: {
        click
    }
} = ReactTestUtils;

function getRenderedMessagesCount() {
    return document.querySelectorAll('.gd-messages .gd-message').length;
}

function clickFirstRenderedMessageCloseButton() {
    click(document.querySelector('.gd-message-dismiss.icon-cross'));
}

describe('Messages', () => {
    function render(props) {
        const Wrapped = withRedux(Messages);

        return renderIntoDocument(
            <Wrapped {...props} />
        );
    }

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('shall render list of messages', () => {
        render({
            messages: [{
                id: 'id1',
                text: 'Message #1',
                type: 'success'
            }, {
                id: 'id2',
                text: 'Message #2',
                type: 'error'
            }]
        });

        expect(getRenderedMessagesCount()).to.equal(2);
    });

    it('shall pass message id to onMessageClose callback', () => {
        const ID = 'very_unique_id';
        const hideMessage = sinon.stub();

        render({
            messages: [{
                id: ID,
                text: 'Foo bar!',
                type: 'progress'
            }],
            hideMessage
        });

        clickFirstRenderedMessageCloseButton();

        expect(hideMessage).to.be.calledOnce();
        expect(hideMessage).to.be.calledWith(ID);
    });
});

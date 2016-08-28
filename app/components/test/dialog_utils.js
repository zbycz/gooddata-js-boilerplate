import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import withRedux from '../../utils/with_redux';
import withIntl from '../../utils/with_intl';

import ConfirmDialogBase from 'goodstrap/packages/Dialog/ReactConfirmDialogBase';

const {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    Simulate: {
        keyDown,
        click
    }
} = ReactTestUtils;

export function dialogClickSubmit(dialog) {
    const submitButton = findRenderedDOMComponentWithClass(dialog, 's-dialog-submit-button');

    click(submitButton);
}

export function dialogClickCancel(dialog) {
    const cancelButton = findRenderedDOMComponentWithClass(dialog, 's-dialog-cancel-button');

    click(cancelButton);
}

export function dialogEnterSubmit(dialog, inputClassName = 'input-text') {
    const input = findRenderedDOMComponentWithClass(dialog, inputClassName);

    keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
}

export function createRendererFor(Dialog) {
    return props => {
        const WrappedComponent = withIntl(withRedux(Dialog));

        return renderIntoDocument(
            <WrappedComponent
                ConfirmDialog={ConfirmDialogBase}
                {...props}
            />
        );
    };
}

import React from 'react';
import {
    renderIntoDocument,
    findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';

import Trash from '../Trash.jsx';

import withIntl from '../../../utils/with_intl';

describe('Trash', () => {
    const WrappedTrash = withIntl(Trash);

    it('should add hover class when isOver', () => {
        const res = renderIntoDocument(
            <WrappedTrash isOver />
        );

        const trash = findRenderedDOMComponentWithClass(res, 'adi-trash');

        expect(trash.className).to.contain('adi-droppable-hover');
    });
});

import React from 'react';
import { renderIntoDocument, findRenderedComponentWithType } from 'react-addons-test-utils';
import { fromJS } from 'immutable';

import CatalogueListItemContainer from '../CatalogueListItemContainer';
import DraggableCatalogueListItem from '../DraggableCatalogueListItem';


import withRedux from '../../../utils/with_redux';
import withIntl from '../../../utils/with_intl';
import withDragDrop from '../../../utils/with_drag_drop_context';


describe('CatalogueListItemContainer', () => {
    describe('Component', () => {
        const Wrapped = withRedux(
            withDragDrop(
                withIntl(CatalogueListItemContainer)
            )
        );
        const defaultProps = {
            item: fromJS({
                type: 'fact'
            })
        };

        it('should render draggable catalogue list item', () => {
            const root = renderIntoDocument(
                <Wrapped {...defaultProps} />
            );

            findRenderedComponentWithType(root, DraggableCatalogueListItem);
        });
    });
});

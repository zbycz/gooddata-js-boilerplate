import React from 'react';
import { renderIntoDocument, findRenderedComponentWithType } from 'react-addons-test-utils';
import { IntlProvider } from 'react-intl';
import translations from '../../../translations/en';
import { fromJS } from 'immutable';

import DraggableCatalogueListItem, { dragConfig } from '../DraggableCatalogueListItem';
import Header from '../CatalogueHeader';
import CatalogueItem from '../CatalogueItem';

import * as ItemTypes from '../../../constants/DragItemTypes';

import withDragDrop from '../../../utils/with_drag_drop_context';
import Target from './../../../utils/simple_drop_target';


describe('DraggableCatalogueListItem', () => {
    describe('Component', () => {
        function render(item) {
            const dispatch = sinon.spy();

            return renderIntoDocument(
                <IntlProvider locale="en" messages={translations}>
                    <DraggableCatalogueListItem.DecoratedComponent item={item} dispatch={dispatch} />
                </IntlProvider>
            );
        }

        const headerItem = fromJS({
            identifier: 'sample_header',
            isGroupHeader: true,
            type: 'header'
        });

        const dateItem = fromJS({
            identifier: 'sample_date',
            title: 'Some title',
            type: 'date',
            isAvailable: true,
            summary: 'Some interesting summary'
        });

        it('should render Header if header item is supplied', () => {
            const component = render(headerItem);
            findRenderedComponentWithType(component, Header);
        });

        it('should render CatalogueItem if date item is supplied', () => {
            const component = render(dateItem);
            findRenderedComponentWithType(component, CatalogueItem);
        });
    });

    describe('#beginDrag', () => {
        const Wrapped = withDragDrop(DraggableCatalogueListItem);

        it('should return item from params as drag item', () => {
            const dispatch = sinon.spy();
            const { item } = dragConfig.beginDrag({ item: fromJS({ type: 'fact' }), dispatch });

            expect(item.get('type')).to.equal('fact');

            expect(dispatch.args.length).to.eql(1);
            const message = dispatch.args[0][0];
            expect(message.type).to.eql('DND_ITEM_DRAG_BEGIN');
        });

        it('should pass item from props as drag data [simulated dnd]', done => {
            const dispatch = sinon.spy();

            const item = fromJS({
                success: true,
                type: 'fact'
            });
            const onDrop = data => {
                expect(data.item).to.eql(item);
                done();
            };

            const root = renderIntoDocument(<Wrapped item={item} dispatch={dispatch} />);
            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const target = new Target(onDrop);
            const targetId = registry.addTarget(ItemTypes.CATALOGUE_LIST_ITEM, target);

            const source = findRenderedComponentWithType(root, DraggableCatalogueListItem);
            const sourceId = source.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);
            backend.simulateDrop();
            backend.simulateEndDrag();
        });
    });
});

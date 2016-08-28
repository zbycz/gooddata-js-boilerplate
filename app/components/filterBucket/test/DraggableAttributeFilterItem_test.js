import React from 'react';
import { renderIntoDocument, findRenderedComponentWithType } from 'react-addons-test-utils';
import { fromJS } from 'immutable';

import DraggableFilterItem, { dragConfig } from '../DraggableFilterItem';
import AttributeFilterItem from '../AttributeFilterItem';

import { decoratedMetricAttributeFilter } from '../../../models/metric_attribute_filter';

import * as ItemTypes from '../../../constants/DragItemTypes';

import withIntl from '../../../utils/with_intl';
import withDragDrop from '../../../utils/with_drag_drop_context';
import Target from './../../../utils/simple_drop_target';


describe('DraggableFilterItem', () => {
    let attribute, props;

    beforeEach(() => {
        attribute = fromJS({ type: 'fact' });

        props = {
            bucketItem: fromJS({ attribute, filters: [decoratedMetricAttributeFilter()] })
        };
    });

    describe('Component', () => {
        let component;

        beforeEach(() => {
            let Wrapped = withIntl(DraggableFilterItem.DecoratedComponent);
            component = renderIntoDocument(<Wrapped {...props} FilterItem={AttributeFilterItem} />);
        });

        it('should render AttributeFilterItem', () => {
            findRenderedComponentWithType(component, AttributeFilterItem);
        });
    });

    describe('#beginDrag', () => {
        let Wrapped;

        beforeEach(() => {
            Wrapped = withDragDrop(withIntl(DraggableFilterItem));
        });

        it('should return item from params as drag item', () => {
            let item = dragConfig.beginDrag(props).item;

            expect(item).to.equal(props.bucketItem.get('attribute'));
        });

        it('should pass item from props as drag data [simulated dnd]', done => {
            let onDrop = data => {
                    expect(data.item).to.equal(props.bucketItem.get('attribute'));
                    done();
                },
                root = renderIntoDocument(<Wrapped FilterItem={AttributeFilterItem} bucketItem={props.bucketItem} />),
                backend = root.getManager().getBackend(),
                registry = root.getManager().getRegistry(),
                target = new Target(onDrop),
                targetId = registry.addTarget(ItemTypes.BUCKET_ITEM, target),
                source = findRenderedComponentWithType(root, DraggableFilterItem),
                sourceId = source.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);
            backend.simulateDrop();
            backend.simulateEndDrag();
        });
    });
});

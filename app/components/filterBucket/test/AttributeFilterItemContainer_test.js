import React from 'react';
import { renderIntoDocument, findRenderedComponentWithType } from 'react-addons-test-utils';
import { fromJS } from 'immutable';

import AttributeFilterItemContainer from '../AttributeFilterItemContainer';
import DraggableFilterItem from '../DraggableFilterItem';
import AttributeFilterItem from '../AttributeFilterItem';

import { decoratedMetricAttributeFilter } from '../../../models/metric_attribute_filter';

import withRedux from '../../../utils/with_redux';
import withIntl from '../../../utils/with_intl';
import withDragDrop from '../../../utils/with_drag_drop_context';


describe('AttributeFilterItemContainer', () => {
    describe('Component', () => {
        let Wrapped = withRedux(
                withDragDrop(
                    withIntl(AttributeFilterItemContainer)
                )
            ),
            props = {
                bucketItem: fromJS({ attribute: {}, filters: [decoratedMetricAttributeFilter()] })
            };

        it('should render draggable filter item with attribute filter item', () => {
            let component = renderIntoDocument(<Wrapped {...props} />),
                draggable = findRenderedComponentWithType(component, DraggableFilterItem);

            findRenderedComponentWithType(draggable, AttributeFilterItem);
        });
    });
});

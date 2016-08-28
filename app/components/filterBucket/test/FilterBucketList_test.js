import React from 'react';
import { decoratedMetricAttributeFilter } from '../../../models/metric_attribute_filter';
import { FILTERS } from '../../../constants/bucket';

import {
    renderIntoDocument,
    findRenderedComponentWithType,
    scryRenderedComponentsWithType
} from 'react-addons-test-utils';

import { fromJS } from 'immutable';

import FilterBucketList from '../FilterBucketList';
import DraggableFilterItem from '../DraggableFilterItem';
import BucketDropTarget from '../../buckets/BucketDropTarget';

import withRedux from '../../../utils/with_redux';
import withDragDrop from '../../../utils/with_drag_drop_context';
import withIntl from '../../../utils/with_intl';

describe('FilterBucketList', () => {
    describe('Component', () => {
        let component, list, props;

        beforeEach(() => {
            let Wrapped = withIntl(withDragDrop(withRedux(FilterBucketList)));

            props = {
                visualizationType: 'column',
                buckets: fromJS({
                    [FILTERS]: {
                        keyName: FILTERS,
                        items: [
                            { attribute: {}, filters: [decoratedMetricAttributeFilter()] },
                            { attribute: {}, filters: [decoratedMetricAttributeFilter()] }
                        ]
                    },
                    original: {}
                }),
                timezoneOffset: 0
            };

            component = renderIntoDocument(<Wrapped {...props} />);
            list = findRenderedComponentWithType(component, FilterBucketList);
        });

        it('should render items', () => {
            let itemCount = scryRenderedComponentsWithType(list, DraggableFilterItem).length;
            expect(itemCount).to.equal(2);
        });

        it('should render drop target', () => {
            findRenderedComponentWithType(list, BucketDropTarget);
        });
    });
});

import React from 'react';
import { renderIntoDocument, findRenderedComponentWithType } from 'react-addons-test-utils';
import { fromJS } from 'immutable';

import AttributeFilterItem from '../AttributeFilterItem';
import AttributeFilter from '../../buckets/AttributeFilter';

import { decoratedMetricAttributeFilter } from '../../../models/metric_attribute_filter';

import withIntl from '../../../utils/with_intl';

describe('AttributeFilterItem', () => {
    describe('Component', () => {
        let component, filter, props;

        beforeEach(() => {
            filter = decoratedMetricAttributeFilter();

            props = {
                bucketItem: fromJS({ attribute: {}, filters: [filter] })
            };

            let Wrapped = withIntl(AttributeFilterItem),
                wrapped = renderIntoDocument(<Wrapped {...props} />);

            component = findRenderedComponentWithType(wrapped, AttributeFilter);
        });

        it('should pass correct filter object', () => {
            expect(component.props.filter).to.equal(props.bucketItem.get('filters').first());
        });

        it('should render attribute filter with correct context class', () => {
            expect(component.props.contextClass).to.equal('adi-filter-bucket');
        });
    });
});

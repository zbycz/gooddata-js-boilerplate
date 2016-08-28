import React, { Component, PropTypes } from 'react';
import pureRender from 'pure-render-decorator';

import FilterItem from './FilterItem.jsx';
import AttributeFilter from '../buckets/AttributeFilter';

@pureRender
export default class AttributeFilterItem extends Component {

    static propTypes = {
        bucketItem: PropTypes.object.isRequired,
        onLoadAttributeElements: PropTypes.func,
        onUpdateAttributeFilter: PropTypes.func
    };

    render() {
        let props = this.props,
            item = props.bucketItem,
            filter = item.get('filters').first();

        return (
            <FilterItem bucketItem={item}>
                <AttributeFilter
                    {...props}
                    filter={filter}
                    onLoadAttributeElements={(...args) =>
                        props.onLoadAttributeElements(filter.getIn(['attribute', 'dfUri']), ...args)}
                    onApply={(...args) =>
                        props.onUpdateAttributeFilter(item.get('original'), filter.get('original'), ...args)}
                    contextClass="adi-filter-bucket"
                />
            </FilterItem>
        );
    }
}

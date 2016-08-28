import React, { Component, PropTypes } from 'react';
import pureRender from 'pure-render-decorator';

import FilterItem from './FilterItem.jsx';
import DateFilter from './DateFilter';
import NoDateAvailable from '../shared/NoDateAvailable';

@pureRender
export default class DateFilterItem extends Component {

    static propTypes = {
        bucketItem: PropTypes.object.isRequired,
        dateDataSets: PropTypes.object.isRequired,
        onUpdateAttributeFilter: PropTypes.func
    };

    renderFilter(item) {
        const filter = item.get('filters').first();

        return (
            <DateFilter
                {...this.props}
                filter={filter}
                onApply={(...args) =>
                                this.props.onUpdateAttributeFilter(item.get('original'), filter.get('original'), ...args)}
            />
        );
    }

    render() {
        const { bucketItem, dateDataSets } = this.props;
        const dateDataSetIsAvailable = dateDataSets
            && dateDataSets.get('items').size > 0
            && dateDataSets.get('dateDataSet');

        return (
            <FilterItem bucketItem={bucketItem} className="adi-date-filter s-date-filter">
                {dateDataSetIsAvailable ? this.renderFilter(bucketItem) :
                    <NoDateAvailable
                        {...this.props}
                        message="dashboard.bucket_item.no_date_available_filter"
                    />
                }
            </FilterItem>
        );
    }
}

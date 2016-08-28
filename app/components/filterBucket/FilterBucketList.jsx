import React, { Component, PropTypes } from 'react';
import pureRender from 'pure-render-decorator';

import BucketDropTarget from '../buckets/BucketDropTarget';
import DateFilterItemContainer from './DateFilterItemContainer';
import AttributeFilterItemContainer from './AttributeFilterItemContainer';

import { isAllowedToAdd, isAllowedToChangeDateFilterDimension } from '../../models/bucket_rules';
import { FILTERS } from '../../constants/bucket';

export function ruleFunc(func, { visualizationType, buckets, to }) {
    return draggedData => func(visualizationType, buckets, { ...draggedData, to });
}

export function itemIsAllowedToDrop(params) {
    return ruleFunc(isAllowedToAdd, params);
}

@pureRender
export default class FilterBucketList extends Component {
    static propTypes = {
        buckets: PropTypes.object.isRequired,
        visualizationType: PropTypes.string.isRequired,
        timezoneOffset: PropTypes.number.isRequired
    };

    render() {
        let { visualizationType, buckets } = this.props,
            bucket = buckets.get(FILTERS),
            items = bucket.get('items'),
            allowedToDrop = itemIsAllowedToDrop({
                visualizationType,
                buckets: buckets.get('original'),
                to: bucket.get('keyName')
            });

        return (
            <ul>
                {items.map((item, idx) => {
                    let FilterTag = item.get('isDate') ?
                        DateFilterItemContainer : AttributeFilterItemContainer;
                    return (
                        <FilterTag
                            {...this.props}
                            key={idx}
                            bucket={bucket}
                            bucketItem={item}
                            isSelectDisabled={!isAllowedToChangeDateFilterDimension(visualizationType, buckets.get('original'))}
                        />
                    );
                }).toArray()}
                <li key={items.size}>
                    <BucketDropTarget {...this.props} bucket={bucket} itemIsAllowedToDrop={allowedToDrop} />
                </li>
            </ul>
        );
    }
}

import React, { Component, PropTypes } from 'react';
import pureRender from 'pure-render-decorator';
import BucketDropTarget from './BucketDropTarget';
import BucketItem from './BucketItem';

import * as Rules from '../../models/bucket_rules';

@pureRender
export default class BucketContent extends Component {

    static propTypes = {
        buckets: PropTypes.shape({ get: PropTypes.function }).isRequired,
        bucket: PropTypes.shape({ get: PropTypes.function }).isRequired,
        visualizationType: PropTypes.string.isRequired
    };

    ruleFunc(func, { visualizationType, buckets, to }) {
        return draggedData => func(visualizationType, buckets, { ...draggedData, to });
    }

    itemIsAllowedToDrop(params) {
        return this.ruleFunc(Rules.isAllowedToAdd, params);
    }

    itemIsAllowedToReplace(params) {
        return this.ruleFunc(Rules.isAllowedToReplace, params);
    }

    render() {
        const { visualizationType, buckets, bucket } = this.props;
        const items = bucket.get('items');
        const dropProps = {
            visualizationType,
            buckets: buckets.get('original'),
            to: bucket.get('keyName')
        };
        const allowedToDrop = this.itemIsAllowedToDrop(dropProps);
        const allowedToReplace = this.itemIsAllowedToReplace(dropProps);
        const canDropMoreItems = this.ruleFunc(Rules.isAllowedToAddMetricsStacks, dropProps)();

        return (
            <div className="bucket-contents">
                {items.size ?
                    <ul>
                        {items.map((item, idx) => (
                            <BucketItem
                                key={idx}
                                itemIsAllowedToDrop={allowedToReplace}
                                bucketItem={item}
                                bucket={bucket}
                            />
                        )).toJS()}
                    </ul> :
                    <div className="empty"></div>
                }
                {canDropMoreItems &&
                    <BucketDropTarget
                        bucket={bucket}
                        itemIsAllowedToDrop={allowedToDrop}
                    />
                }
            </div>
        );
    }
}

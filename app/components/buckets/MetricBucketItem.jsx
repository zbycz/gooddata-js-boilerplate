import React, { PropTypes } from 'react';
import { bindAll } from 'lodash';
import pureRender from 'pure-render-decorator';
import { connect } from 'react-redux';
import BucketItemHeader from './BucketItemHeader';
import MetricBucketItemConfiguration from './MetricBucketItemConfiguration';

import * as Actions from '../../actions/buckets_actions';
import * as DataActions from '../../actions/data_actions';

import { bucketsSelector } from '../../selectors/buckets_selector';

@pureRender
export class MetricBucketItem extends React.Component {

    static propTypes = {
        bucketItem: PropTypes.object.isRequired,
        catalogueItemDetailRequested: PropTypes.func,
        setBucketItemAggregation: PropTypes.func,
        setBucketItemCollapsed: PropTypes.func,
        connectDragSource: PropTypes.func
    };

    constructor() {
        super();

        bindAll(this, ['onShowBubble', 'onSetAttributeAggregation']);
    }

    onShowBubble(item) {
        if (!item.get('details')) {
            this.props.catalogueItemDetailRequested(item.toJS());
        }
    }

    onSetAttributeAggregation(item, value) {
        this.props.setBucketItemAggregation({ item, value });
    }

    renderHeader() {
        const { bucketItem, setBucketItemCollapsed, connectDragSource } = this.props;
        const header = (
            <div>
                <BucketItemHeader
                    title={bucketItem.get('metricTitle')}
                    filters={bucketItem.get('filters')}
                    isCollapsed={bucketItem.get('collapsed')}
                    onToggleCollapse={collapsed => setBucketItemCollapsed({ item: bucketItem.get('original'), collapsed })}
                />
            </div>
        );
        if (connectDragSource) {
            return connectDragSource(header);
        }
        return header;
    }

    render() {
        const bucketItem = this.props.bucketItem;
        return (
            <div>
                {this.renderHeader()}
                {!bucketItem.get('collapsed') ?
                    <MetricBucketItemConfiguration
                        bucketItem={bucketItem}
                        onShowBubble={this.onShowBubble}
                        onSetAttributeAggregation={this.onSetAttributeAggregation}
                    /> : false}
            </div>
        );
    }
}

export default connect(bucketsSelector, { ...Actions, ...DataActions })(MetricBucketItem);

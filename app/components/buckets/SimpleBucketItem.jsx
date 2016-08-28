import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import pureRender from 'pure-render-decorator';

import CatalogueListItem from '../catalogue/CatalogueListItem';
import DateConfiguration from './categories/DateConfiguration';

@pureRender
export default class SimpleBucketItem extends Component {
    static propTypes = {
        bucketItem: PropTypes.object.isRequired,
        connectDragSource: PropTypes.func
    };

    renderDateConfiguration(bucketItem) {
        if (bucketItem.get('isDate')) {
            return <DateConfiguration bucketItem={bucketItem} />;
        }

        return null;
    }

    renderHeader() {
        const { bucketItem, connectDragSource } = this.props;

        const header = (
            <div>
                <div className="adi-bucket-invitation-inner">
                    <FormattedMessage id="dashboard.bucket_item.replace" />
                </div>

                <div className="adi-bucket-item-header">
                    <CatalogueListItem
                        item={bucketItem.get('attribute')}
                        draggable={false}
                        bubbleHelp={false}
                        available
                    />
                </div>
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
                {this.renderDateConfiguration(bucketItem)}
            </div>
        );
    }
}

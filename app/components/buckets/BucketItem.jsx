import React, { Component } from 'react';
import { connect } from 'react-redux';

import DroppableBucketItem from './DroppableBucketItem';
import * as Actions from '../../actions/dnd_actions';

class BucketItem extends Component {
    render() {
        return <DroppableBucketItem {...this.props} />;
    }
}

export function mapDispatchToProps(dispatch) {
    return {
        onCatalogueItemDropped(payload) {
            dispatch(Actions.replaceBucketItem(payload));
        },
        onItemSwapped(payload) {
            dispatch(Actions.swapBucketItem(payload));
        },
        onDragEnd(payload) {
            dispatch(Actions.endDragCatalogueItem(payload));
        }
    };
}
export default connect(null, mapDispatchToProps)(BucketItem);

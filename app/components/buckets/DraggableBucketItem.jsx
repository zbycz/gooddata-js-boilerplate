import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import { omit, identity } from 'lodash';

import BucketItem from './BucketItemPure.jsx';
import * as ItemTypes from '../../constants/DragItemTypes';


class DraggableBucketItem extends Component {

    static propTypes = {
        connectDragSource: PropTypes.func,
        connectDragPreview: PropTypes.func,
        isDragging: PropTypes.bool,
        bucket: PropTypes.object
    };

    static defaultProps = {
        connectDragSource: identity,
        connectDragPreview: identity
    };

    render() {
        const pureProps = omit(this.props, ['connectDragPreview', 'isDragging', 'bucket']);
        return <BucketItem {...pureProps} />;
    }

}


export const dragConfig = {
    beginDrag(props) {
        const { bucketItem, bucket } = props;
        const collapsedItem = bucketItem.set('collapsed', true);

        function renderDraggedItemElement() {
            const style = { transition: 'none', transform: 'none', zIndex: 5000000 };
            return (
                <BucketItem bucketItem={collapsedItem} className="adi-dragged-item" style={style} />
            );
        }

        return {
            type: ItemTypes.BUCKET_ITEM,
            item: bucketItem.get('attribute'),
            bucketItem: bucketItem.get('original'),
            from: (bucket && bucket.get('keyName')) || '',
            dragged: bucketItem.getIn(['attribute', 'type']),
            // custom layer rendered component
            renderDraggedItemElement
        };
    }
};
function collectDrag(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    };
}

export default DragSource(ItemTypes.BUCKET_ITEM, dragConfig, collectDrag)(DraggableBucketItem);

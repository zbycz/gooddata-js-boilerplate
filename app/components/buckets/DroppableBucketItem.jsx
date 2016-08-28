import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import { identity, omit } from 'lodash';
import classNames from 'classnames';

import * as ItemTypes from '../../constants/DragItemTypes';
import DraggableBucketItem from './DraggableBucketItem';


class DroppableBucketItem extends Component {
    static propTypes = {
        connectDropTarget: PropTypes.func,
        onCatalogueItemDropped: PropTypes.func,
        onItemSwapped: PropTypes.func,

        itemIsAllowedToDrop: PropTypes.func,
        isBeingReplaced: PropTypes.bool,
        isOver: PropTypes.bool
    };
    static defaultProps = {
        connectDropTarget: identity,
        onCatalogueItemDropped: identity,
        onItemSwapped: identity
    };

    render() {
        // adi-droppable-active adi-droppable-hover adi-replace-invitation
        const { isBeingReplaced, isOver, connectDropTarget } = this.props;
        const pureProps = omit(this.props, ...Object.keys(DroppableBucketItem.propTypes));

        const classes = classNames({
            'adi-replace-invitation': isBeingReplaced,
            'adi-droppable-active': isBeingReplaced,
            'adi-droppable-hover': isOver && isBeingReplaced
        });

        return connectDropTarget(
            <li>
                <DraggableBucketItem {...pureProps} className={classes} />
            </li>
        );
    }
}

export const dropConfig = {
    drop({ onCatalogueItemDropped, onItemSwapped, bucketItem, keyName, bucket }, monitor) {
        switch (monitor.getItemType()) {
            case ItemTypes.BUCKET_ITEM:
                onItemSwapped({
                    from: monitor.getItem().bucketItem,
                    to: bucketItem.get('original'),
                    original: {
                        ...monitor.getItem(),
                        to: bucket.get('keyName')
                    }
                });
                break;
            case ItemTypes.CATALOGUE_LIST_ITEM:
                onCatalogueItemDropped({
                    bucketItem: bucketItem.get('original'),
                    catalogueItem: monitor.getItem().item,
                    keyName
                });
                break;

            default:
                return;
        }
    },

    canDrop({ itemIsAllowedToDrop, bucketItem }, monitor) {
        const isAllowed = itemIsAllowedToDrop || (() => true);
        const draggedItem = monitor.getItem();

        return isAllowed({ ...draggedItem, bucketItem });
    }
};
function collectDrop(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),

        isBeingReplaced: monitor.canDrop(),
        isOver: monitor.isOver()
    };
}
export default DropTarget([ItemTypes.CATALOGUE_LIST_ITEM, ItemTypes.BUCKET_ITEM], dropConfig, collectDrop)(DroppableBucketItem);

import React, { Component, PropTypes } from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { DropTarget } from 'react-dnd';
import { connect } from 'react-redux';
import classNames from 'classnames';

import Bubble from 'Bubble/ReactBubble';
import BubbleHoverTrigger from 'Bubble/ReactBubbleHoverTrigger';

import * as Actions from '../../actions/dnd_actions';
import * as FilterActions from '../../actions/buckets_actions';
import * as ItemTypes from '../../constants/DragItemTypes';

import { identity } from 'lodash';


class BucketDropTarget extends Component {

    static propTypes = {
        onCatalogueItemDropped: PropTypes.func,
        onFilterItemDropped: PropTypes.func,
        onItemSwapped: PropTypes.func,
        connectDropTarget: PropTypes.func.isRequired,
        dropZoneTitle: PropTypes.string,
        acceptsDraggedObject: PropTypes.bool,
        isOver: PropTypes.bool,
        bucket: PropTypes.shape({ get: PropTypes.func })
    };

    static defaultProps = {
        onCatalogueItemDropped: identity,
        onFilterItemDropped: identity,
        onItemSwapped: identity
    };


    renderInvitation() {
        const props = this.props;

        return (
            <div className="adi-bucket-invitation-inner">
                {props.acceptsDraggedObject ?
                    <FormattedMessage id="dashboard.bucket.drop" /> :
                    <FormattedHTMLMessage
                        id={`dashboard.bucket.${props.bucket.get('keyName')}_add_placeholder`}
                    />
                }
            </div>
        );
    }

    render() {
        const props = this.props;
        const items = props.bucket.get('items');
        const keyName = props.bucket.get('keyName');
        const canAcceptMoreItems = props.bucket.get('itemsLimit', Infinity) > items.size;
        const isFiltersBucket = keyName === 'filters';

        const bubbleClassNames = classNames(
            'adi-bucket-invitation',
            `s-bucket-invitation-${keyName}`
        );

        const dropZoneClassNames = classNames(
            'adi-bucket-invitation-outer',
            's-bucket-dropzone',
            {
                'adi-droppable-active': props.acceptsDraggedObject,
                'adi-droppable-hover': props.isOver && props.acceptsDraggedObject
            }
        );

        return props.connectDropTarget(
            <div className={classNames({ invisible: !canAcceptMoreItems })}>
                {!isFiltersBucket &&
                    <hr className="adi-bucket-invitation-separator" />
                }
                <div
                    className={dropZoneClassNames}
                    data-bubbletitlealignpoints="cr cl"
                    title={props.dropZoneTitle}
                >
                    <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                        <div className={bubbleClassNames}>
                            {this.renderInvitation()}
                        </div>
                        <Bubble
                            className="bubble-primary"
                            alignPoints={[{ align: isFiltersBucket ? 'bc tc' : 'cr cl' }]}
                        >
                            <FormattedHTMLMessage
                                id={`dashboard.bucket.${keyName}_dropzone_hint`}
                            />
                        </Bubble>
                    </BubbleHoverTrigger>
                </div>
            </div>
        );
    }
}

export const dropConfig = {

    drop({ onCatalogueItemDropped, onItemSwapped, onFilterItemDropped, bucket }, monitor) {
        const catalogueItem = monitor.getItem().item;
        const keyName = bucket.get('keyName');

        switch (monitor.getItemType()) {
            case ItemTypes.BUCKET_ITEM:
                onItemSwapped({
                    keyName,
                    from: monitor.getItem().bucketItem,
                    original: monitor.getItem()
                });
                break;
            case ItemTypes.CATALOGUE_LIST_ITEM:
                if (keyName === 'filters') {
                    onFilterItemDropped({ keyName, catalogueItem });
                } else {
                    onCatalogueItemDropped({ keyName, catalogueItem });
                }

                break;

            default:
                return;
        }
    },

    canDrop({ itemIsAllowedToDrop }, monitor) {
        const isAllowed = itemIsAllowedToDrop || (() => true);
        const draggedItem = monitor.getItem();

        return isAllowed(draggedItem);
    }

};

function collect(connection, monitor) {
    return {
        connectDropTarget: connection.dropTarget(),

        acceptsDraggedObject: monitor.canDrop(),
        isOver: monitor.isOver()
    };
}

export function mapDispatchToProps(dispatch) {
    const onCatalogueItemDropped = item => {
        dispatch(Actions.dropCatalogItem(item));
    };

    const onItemSwapped = payload => {
        dispatch(Actions.swapBucketItem(payload));
    };

    const onFilterItemDropped = payload => {
        dispatch(FilterActions.setBucketItemAddFilter(payload));
    };

    return {
        onCatalogueItemDropped,
        onItemSwapped,
        onFilterItemDropped
    };
}

export const Pure = BucketDropTarget;
export const Target = DropTarget([ItemTypes.CATALOGUE_LIST_ITEM, ItemTypes.BUCKET_ITEM], dropConfig, collect)(Pure);
export const Container = connect(null, mapDispatchToProps)(Target);

export default Container;

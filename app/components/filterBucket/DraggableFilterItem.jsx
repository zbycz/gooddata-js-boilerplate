import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import { omit, identity, bindAll } from 'lodash';
import classNames from 'classnames';

import * as ItemTypes from '../../constants/DragItemTypes';

class DraggableFilterItem extends Component {

    static propTypes = {
        connectDragSource: PropTypes.func,
        connectDragPreview: PropTypes.func,
        isDragging: PropTypes.bool,
        bucket: PropTypes.object,
        FilterItem: PropTypes.func
    };

    static defaultProps = {
        connectDragSource: identity,
        connectDragPreview: identity
    };

    constructor() {
        super();
        this.state = { hover: false };

        bindAll(this, ['onMouseOver', 'onMouseOut']);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.isDragging && !this.props.isDragging) {
            // not hovering anymore, but browser thinks it is
            // prove him wrong!
            this.setState({ hover: false });
        }
    }

    onMouseOver() {
        this.setState({ hover: true });
    }

    onMouseOut() {
        this.setState({ hover: false });
    }

    render() {
        let { FilterItem, connectDragSource, className } = this.props,
            classes = classNames(className, { 'adi-filter-button-hover': this.state.hover }),
            pureProps = omit(this.props, ...Object.keys(DraggableFilterItem.propTypes));

        return connectDragSource(
            <li onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut}>
                <FilterItem {...pureProps} className={classes} />
            </li>
        );
    }
}

export const dragConfig = {
    beginDrag(props) {
        const { FilterItem, bucketItem, bucket, dateDataSets } = props;

        function renderDraggedItemElement() {
            const style = { transition: 'none', transform: 'none', zIndex: 5000000 };
            let filterProps = {
                style,
                bucketItem
            };
            if (bucketItem.get('isDate')) {
                filterProps.dateDataSets = dateDataSets;
            }
            return (
                <FilterItem className="adi-dragged-item" {...filterProps} />
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

export default DragSource(ItemTypes.BUCKET_ITEM, dragConfig, collectDrag)(DraggableFilterItem);

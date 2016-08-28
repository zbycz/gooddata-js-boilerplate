// Copyright (C) 2007-2016, GoodData(R) Corporation. All rights reserved.

import React, { Component, PropTypes } from 'react';
import { identity, omit } from 'lodash';
import classNames from 'classnames';
import { DragSource } from 'react-dnd';

import CatalogueListItem from './CatalogueListItem';
import { CATALOGUE_LIST_ITEM } from '../../constants/DragItemTypes';
import * as Actions from '../../actions/dnd_actions';

export class DraggableCatalogueListItem extends Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        connectDragSource: PropTypes.func,
        connectDragPreview: PropTypes.func,
        onDragEnd: PropTypes.func,
        isDragging: PropTypes.bool,
        className: PropTypes.string
    };

    static defaultProps = {
        connectDragSource: identity,
        connectDragPreview: identity,
        onDragEnd: identity,
        isDragging: false,
        className: ''
    };

    constructor() {
        super();

        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);

        this.state = { hover: false };
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
        const { connectDragSource, className, isDragging } = this.props;

        const classes = classNames(
            className,
            { 'adi-catalogue-item-hover': this.state.hover && !isDragging }
        );
        const pureProps = omit(this.props, ...Object.keys(DraggableCatalogueListItem.propTypes));

        return connectDragSource(
            // only native elements can be used for drag source (event handlers are being attached to them by dnd)
            <div
                className="adi-catalogue-item-wrapper"
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
            >
                <CatalogueListItem {...pureProps} className={classes} isDragging={isDragging} />
            </div>
        );
    }
}

export const dragConfig = {
    beginDrag(props) {
        const { dispatch, item } = props;
        /* eslint-disable react/no-multi-comp */
        function renderDraggedItemElement() {
            return (
                <CatalogueListItem
                    {...props}
                    bubbleHelp={false}
                    className="adi-dragged-item"
                    style={{ margin: '0 15px 0 16px' }}
                />
            );
        }

        dispatch(Actions.startDragCatalogueItem(item));

        /* eslint-enable react/no-multi-comp */

        return {
            type: CATALOGUE_LIST_ITEM,
            item,
            from: 'catalogue',
            dragged: item.get('type'),
            // custom layer rendered component
            renderDraggedItemElement
        };
    },
    endDrag(props) {
        const { dispatch, item } = props;
        dispatch(Actions.endDragCatalogueItem(item));
    }
};

function collectDrag(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),

        isDragging: monitor.isDragging()
    };
}

export const Source = DraggableCatalogueListItem;
export default DragSource(CATALOGUE_LIST_ITEM, dragConfig, collectDrag)(Source);

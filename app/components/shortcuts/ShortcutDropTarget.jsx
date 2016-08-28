import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
import * as ItemTypes from '../../constants/DragItemTypes';

class ShortcutDropTarget extends Component {
    static propTypes = {
        connectDropTarget: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired,
        onDrop: PropTypes.func,
        isOver: PropTypes.bool,
        isDisabled: PropTypes.bool
    };

    static defaultProps = {
        isDisabled: false
    };

    render() {
        const { connectDropTarget, isOver, isDisabled } = this.props;
        const classes = classNames('adi-shortcut-drop-target', {
            'adi-droppable-hover': isOver && !isDisabled,
            'adi-drop-disabled': isDisabled
        });

        const shortcut = (
            <div className={classes}>
                {this.props.children}
            </div>
        );

        if (isDisabled) {
            return shortcut;
        }

        return connectDropTarget(shortcut);
    }
}

const dropConfig = {
    drop({ onDrop }, monitor) {
        const item = monitor.getItem().item;

        if (monitor.getItemType() === ItemTypes.CATALOGUE_LIST_ITEM && onDrop) {
            onDrop(item);
        }
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    };
}

export default DropTarget([ItemTypes.CATALOGUE_LIST_ITEM], dropConfig, collect)(ShortcutDropTarget);

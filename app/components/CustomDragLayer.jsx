import React, { Component, PropTypes } from 'react';
import { DragLayer } from 'react-dnd';
import { connect } from 'react-redux';
import { identity, get } from 'lodash';
import CustomEvent from 'custom-event';

import * as Actions from '../actions/dnd_actions';


function getItemStyles({ currentOffset }) {
    if (!currentOffset) {
        return {
            display: 'none'
        };
    }

    const transform = `translate(${currentOffset.x}px, ${currentOffset.y}px)`;
    return {
        transform,
        WebkitTransform: transform
    };
}

export function setCurrentState(
    newProps, state, setState,
    dispatch = identity, startAnimation = identity, windowInstance = { dispatchEvent: () => {} }
) {
    const { isDragging, item, currentOffset } = newProps;
    const didDrop = isDragging && !currentOffset;
    const itemChanged = (item !== state.item) && !!item;
    const startedDragging = itemChanged && isDragging;

    if (startedDragging) {
        // item will be required after isDragging is false, as well as initial coordinates
        setState({ item, initialOffset: currentOffset });

        windowInstance.dispatchEvent(new CustomEvent('goodstrap.drag'));
    }

    if (isDragging) {
        setState({ currentOffset });
    }

    if (didDrop) {
        setState({ item: null, initialOffset: null });
    }

    if (!isDragging && !didDrop && state.currentOffset && state.item) {
        dispatch(Actions.dragItemFailed({
            // need to use state data, because at this point the props ones don't exist
            // there is a case when hot reload runs, when there's no state and this is being run
            // in that case use N/A
            mouseX: get(state, ['currentOffset', 'x'], 'N/A'),
            mouseY: get(state, ['currentOffset', 'x'], 'N/A'),
            from: get(state, ['item', 'from'], 'N/A'),
            dragged: get(state, ['item', 'dragged'], 'N/A')
        }));
        startAnimation();
    }
}

function hasReachedInitialPosition({ x, y }, initialOffset, tolerance) {
    return Math.abs(x - initialOffset.x) < tolerance &&
        Math.abs(y - initialOffset.y) < tolerance;
}

function calculateFrameDiff(diff, currentFrame) {
    let dx, dy;

    // diff can be negative, but distance can't
    let distance = { x: Math.abs(diff.x), y: Math.abs(diff.y) };

    // the bigger distance out of the two should be animated faster
    if (distance.x > distance.y) {
        // x is the leading axis
        dx = distance.x - currentFrame;
        dy = distance.y - (distance.y / distance.x * currentFrame);
    } else {
        // y is the leading axis
        dy = distance.y - currentFrame;
        dx = distance.x - (distance.x / distance.y * currentFrame);
    }

    // the increments need to be directed since they are not distances
    dx = distance.x === diff.x ? dx : -dx;
    dy = distance.y === diff.y ? dy : -dy;

    return { dx, dy };
}

class CustomDragLayer extends Component {
    static propTypes = {
        dispatch: React.PropTypes.func.isRequired,
        isDragging: PropTypes.bool,
        itemType: PropTypes.string
    };

    constructor() {
        super();

        this.renderItem = this.renderItem.bind(this);
        this.startAnimation = this.startAnimation.bind(this);
        this.setState = this.setState.bind(this);

        // need to keep item even after drag is done
        // there's no need to push item into the store since this is isolated component visual state
        this.state = { item: null, initialOffset: null };
    }

    componentWillReceiveProps(newProps) {
        setCurrentState(
            newProps,
            this.state,
            this.setState,
            this.props.dispatch, this.startAnimation, window
        );
    }

    startAnimation() {
        let currentFrame = 0;
        const INCREMENT = 30;

        const { currentOffset, initialOffset } = this.state;
        if (!currentOffset || !initialOffset) {
            return;
        }

        const { requestAnimationFrame } = window;
        const diff = { x: currentOffset.x - initialOffset.x, y: currentOffset.y - initialOffset.y };

        const returnAnimationFrame = () => {
            const { x, y } = this.state.currentOffset;
            if (hasReachedInitialPosition({ x, y }, initialOffset, INCREMENT)) {
                // can remove item and initial offset cause there's no need to render it anymore
                this.setState({ item: null, initialOffset: null });
                return;
            }

            const { dx, dy } = calculateFrameDiff(diff, currentFrame);

            this.setState({ currentOffset: { x: initialOffset.x + dx, y: initialOffset.y + dy } });
            currentFrame += INCREMENT;

            requestAnimationFrame(returnAnimationFrame);
        };

        returnAnimationFrame();
    }

    renderItem() {
        const { item } = this.state;

        if (typeof item.renderDraggedItemElement !== 'function') {
            return null;
        }

        return item.renderDraggedItemElement();
    }

    render() {
        const { item } = this.state;

        if (!item) {
            return null;
        }

        return (
            <div className="adi-custom-drag-layer">
                <div style={getItemStyles(this.state)}>
                    {this.renderItem(item)}
                </div>
            </div>
        );
    }
}

const dragLayerConfig = monitor => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    initialOffset: monitor.getInitialClientOffset(),
    isDragging: monitor.isDragging()
});

export const Layer = DragLayer(dragLayerConfig)(CustomDragLayer);

export default connect()(Layer);

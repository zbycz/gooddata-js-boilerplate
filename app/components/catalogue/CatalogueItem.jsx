import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import { getCssClass } from '../../utils/css_class';
import CatalogueDetailsBubble from './CatalogueDetailsBubble';

export function getCatalogueItemClassName(item) {
    if (item.get('type') === 'date') {
        return 's-date';
    }

    return getCssClass(item.get('identifier'), 's-id-');
}

export default class CatalogueItem extends Component {
    static propTypes = {
        draggable: PropTypes.bool,
        bubbleHelp: PropTypes.bool,
        isDragging: PropTypes.bool,
        available: PropTypes.bool,
        onMouseOver: PropTypes.func,
        item: PropTypes.object,
        className: PropTypes.string,
        style: PropTypes.object
    };

    static defaultProps = {
        bubbleHelp: true,
        draggable: true,
        style: {}
    };

    render() {
        const props = this.props,
            item = props.item,
            type = item.get('type'),
            title = item.get('title'),
            isUnavailable = !this.props.available;

        const classes = classNames(
            'adi-catalogue-item',
            `type-${type}`,
            getCatalogueItemClassName(item),
            {
                'not-available': isUnavailable,
                's-item-unavailable': isUnavailable
            },
            props.className
        );

        const bubbleHelp = (
            <CatalogueDetailsBubble
                item={item}
                onShowBubble={props.onShowBubble}
            />
        );

        return (
            <div className={classes} style={props.style}>
                <div>{title}</div>
                {props.bubbleHelp && !props.isDragging && bubbleHelp}
            </div>
        );
    }
}

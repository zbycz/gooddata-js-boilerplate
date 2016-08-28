import React from 'react';
import { fromJS } from 'immutable';

import classNames from 'classnames';
import { getCssClass } from '../../utils/css_class';

import CatalogueDetailsBubble from '../catalogue/CatalogueDetailsBubble';

export default class MetricAttributeListItem extends React.Component {
    static propTypes = {
        item: React.PropTypes.object,
        onShowBubble: React.PropTypes.func
    };

    getClasses(item) {
        return classNames(
            's-filter-item',
            'gd-list-item',
            'adi-filter-item',
            getCssClass(item.identifier, 's-bubble-id-'),
            getCssClass(item.title, 's-')
        );
    }

    render() {
        let item = this.props.item;
        return (
            <div className={this.getClasses(item)}>
                <div>
                    <span className="attr-field-icon"></span>
                    {item.title}
                </div>
                <CatalogueDetailsBubble
                    item={fromJS(item)}
                    offsetX={8}
                    offsetY={0}
                    onShowBubble={() => this.props.onShowBubble(item)}
                />
            </div>
        );
    }
}

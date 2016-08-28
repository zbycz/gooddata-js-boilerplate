import { bindAll } from 'lodash';
import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import pureRender from 'pure-render-decorator';

import classNames from 'classnames';

import { getId, getTitle } from '../../models/attribute_element';

@pureRender
export default class AttributeItem extends Component {
    static propTypes = {
        id: PropTypes.string,
        onSelect: PropTypes.func,
        onOnly: PropTypes.func,
        source: PropTypes.object,
        selected: PropTypes.bool
    };

    static defaultProps = {
        selected: false
    };

    constructor() {
        super();

        bindAll(this, ['onSelect', 'onOnly']);
    }

    onSelect() {
        const { onSelect, source } = this.props;
        onSelect(source);
    }

    onOnly(ev) {
        const { onOnly, source } = this.props;

        ev.stopPropagation();
        onOnly(source);
    }

    renderCheckbox() {
        return (
            <input
                type="checkbox"
                className="input-checkbox"
                readOnly="true"
                checked={this.props.selected}
            />
        );
    }

    renderOnly() {
        return (
            <span
                className="gd-list-item-only"
                onClick={this.onOnly}
            >
                <FormattedMessage id="dashboard.attribute_filter.only" />
            </span>
        );
    }

    render() {
        const { source, selected } = this.props;
        if (!source) {
            return <div />;
        }

        const id = getId(source);
        const title = getTitle(source);
        const classes = classNames(
            'gd-list-item',
            'has-only-visible',
            's-filter-item',
            'adi-filter-item',
            `s-id-${id}`,
            { 'is-selected': selected }
        );

        return (
            <div
                className={classes}
                title={title}
                onClick={this.onSelect}
            >
                <div className="content">
                    {this.renderCheckbox()}
                    {title}
                    {this.renderOnly()}
                </div>
            </div>
        );
    }
}

import { getCssClass } from '../../utils/css_class';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';

export default class CatalogueFilter extends Component {
    static propTypes = {
        onSelect: PropTypes.func.isRequired,
        filters: PropTypes.array.isRequired,
        activeFilterIndex: PropTypes.number.isRequired
    };

    renderFilter(filter, index, isActive) {
        let { name, label } = filter;

        let classes = classNames(
            'gd-tab',
            's-filter-item',
            getCssClass(name, 's-filter-'),
            { 'is-active': isActive }
        );

        return (
            <div key={name} className={classes} onClick={() => this.props.onSelect(index)}>
                <FormattedMessage id={label} />
            </div>
        );
    }

    render() {
        let filters = this.props.filters.map((filter, index) => {
            let isActive = (index === this.props.activeFilterIndex);
            return this.renderFilter(filter, index, isActive);
        });

        return <div className="gd-tabs small is-condensed">{filters}</div>;
    }
}

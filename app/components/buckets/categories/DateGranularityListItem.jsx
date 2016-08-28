import React, { Component, PropTypes } from 'react';
import cx from 'classnames';

export default class DateGranularityListItem extends Component {

    static propTypes = {
        item: PropTypes.object.isRequired,
        activeGranularity: PropTypes.object.isRequired,
        onGranularityChange: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.onGranularityChange = this.onGranularityChange.bind(this);
    }

    onGranularityChange() {
        const { item, onGranularityChange } = this.props;
        onGranularityChange(item);
    }

    render() {
        const { item, activeGranularity } = this.props;
        const granularity = item;

        const isSelected = activeGranularity.get('dateType') === granularity.get('dateType');

        const classNames = cx(
            'gd-list-item',
            'gd-list-item-shortened',
            { 'is-selected': isSelected }
        );

        return (
            <div className={classNames} onClick={this.onGranularityChange}>
                {granularity.get('label')}
            </div>
        );
    }
}

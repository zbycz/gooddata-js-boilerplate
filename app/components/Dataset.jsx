import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

import { getCssClass } from '../utils/css_class';

export default class Dataset extends Component {
    static propTypes = {
        dataset: PropTypes.object.isRequired,
        isSelected: PropTypes.bool,
        onClick: PropTypes.func.isRequired
    };

    static defaultProps = {
        isSelected: false
    };

    render() {
        const { name, identifier } = this.props.dataset;
        const classes = classNames(
            'gd-list-item',
            { 'is-selected': this.props.isSelected },
            getCssClass(identifier || 'production-data', 's-dataset-')
        );

        return <a className={classes} onClick={() => this.props.onClick()}>{name}</a>;
    }
}

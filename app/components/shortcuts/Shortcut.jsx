import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class Shortcut extends Component {
    static propTypes = {
        primary: PropTypes.bool,
        secondary: PropTypes.bool,
        children: PropTypes.node.isRequired
    };

    getClassNames() {
        const { primary, secondary } = this.props;
        return classNames('adi-shortcut', {
            primary,
            secondary
        });
    }

    render() {
        return (
            <div className={this.getClassNames()}>
                {this.props.children}
            </div>
        );
    }
}

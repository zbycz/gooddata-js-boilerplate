import React, { Component, PropTypes } from 'react';

export default class Header extends Component {
    static propTypes = {
        children: PropTypes.object.isRequired
    };

    render() {
        return (
            <div className="adi-catalogue-header">
                {this.props.children}
            </div>
        );
    }
}

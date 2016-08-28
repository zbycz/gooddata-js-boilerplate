import React, { Component, PropTypes } from 'react';
import pureRender from 'pure-render-decorator';
import classNames from 'classnames';

@pureRender
export default class FilterItem extends Component {

    static propTypes = {
        bucketItem: PropTypes.object.isRequired,
        className: PropTypes.string,
        children: PropTypes.object
    };

    getClasses() {
        return classNames(
            ['adi-bucket-item', 's-bucket-item'],
            's-id-' + (this.props.bucketItem.get('execIdentifier') || '').replace(/\./g, '_'), // eslint-disable-line prefer-template
            this.props.className
        );
    }

    render() {
        return <div className={this.getClasses()}>{this.props.children}</div>;
    }
}

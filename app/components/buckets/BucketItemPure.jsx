import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import pureRender from 'pure-render-decorator';

import SimpleBucketItem from './SimpleBucketItem';
import MetricBucketItem from './MetricBucketItem';
import { getCssClass } from '../../utils/css_class';

function getBucketItemClassName(bucketItem) {
    const postfix = bucketItem.getIn(['attribute', 'type']) === 'fact' ? '_generated' : '';

    return getCssClass(bucketItem.getIn(['attribute', 'id']) + postfix, 's-id-').replace(/\./g, '_');
}

@pureRender
export default class BucketItem extends Component {
    static propTypes = {
        bucketItem: PropTypes.object.isRequired,
        className: PropTypes.string
    };

    getClasses() {
        const { className, bucketItem } = this.props;
        return classNames(
            'adi-bucket-item',
            's-bucket-item',
            getBucketItemClassName(bucketItem),
            className
        );
    }

    render() {
        const props = this.props;
        const BucketItemTag = props.bucketItem.get('isMetric') ? MetricBucketItem : SimpleBucketItem;

        return <div className={this.getClasses()}><BucketItemTag {...props} /></div>;
    }
}

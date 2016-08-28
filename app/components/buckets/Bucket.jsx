import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import pureRender from 'pure-render-decorator';

import BucketContent from './BucketContent';
import BucketWarning from './BucketWarning';

import * as Rules from '../../models/bucket_rules';

@pureRender
export default class Bucket extends Component {
    static propTypes = {
        buckets: PropTypes.shape({ get: PropTypes.func }).isRequired,
        bucket: PropTypes.shape({ get: PropTypes.func }).isRequired,
        visualizationType: PropTypes.string.isRequired
    };

    getBucketClasses(props) {
        let itemsCount = props.bucket.get('items').size,
            isEmpty = itemsCount === 0,
            canAddMetricsStacks = this.canAddMoreItemsMetricsStacks(),
            canAdd = itemsCount < props.bucket.get('itemsLimit') && canAddMetricsStacks;

        return classNames(
            'adi-bucket',
            {
                'bucket-with-warn-message': !canAddMetricsStacks,
                's-bucket-empty': isEmpty,
                's-bucket-not-empty': !isEmpty,
                'has-rounded-corners': !canAdd
            },
            this.nameClass()
        );
    }

    getHeaderClasses(props) {
        return classNames(
            'bucket-title',
            's-bucket-title',
            `bucket-title-${this.keyName()}-${props.visualizationType}`,
            `${this.nameClass()}-title`
        );
    }

    canAddMoreItemsMetricsStacks() {
        const { visualizationType, buckets, bucket } = this.props;
        return Rules.isAllowedToAddMetricsStacks(visualizationType, buckets.get('original'), { to: bucket.get('keyName') });
    }

    keyName() {
        return this.props.bucket.get('keyName');
    }

    nameClass() {
        return `s-bucket-${this.keyName()}`;
    }

    renderHeader(props) {
        return (
            <div className={this.getHeaderClasses(props)}>
                <div className="bucket-title-icon"></div>
                <h3>
                    <FormattedMessage
                        id={`dashboard.bucket.${this.keyName()}_title.${props.visualizationType}`}
                    />
                </h3>
            </div>
        );
    }

    renderError(props) {
        return (props.errorMessage ? <div className="gd-bucket-error">{props.errorMessage}</div> : false);
    }

    renderWarning(props) {
        return (
            <BucketWarning
                keyName={this.keyName()}
                canAddMoreItems={this.canAddMoreItemsMetricsStacks()}
                visualizationType={props.visualizationType}
            />
        );
    }

    render() {
        let props = this.props;
        const { buckets, bucket, visualizationType } = this.props;
        return (
            <div className={this.getBucketClasses(props)}>
                {this.renderHeader(props)}
                {this.renderError(props)}
                <BucketContent
                    buckets={buckets}
                    bucket={bucket}
                    visualizationType={visualizationType}
                />
                {this.renderWarning(props)}
            </div>
        );
    }
}

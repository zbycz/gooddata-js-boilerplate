import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';

import Bucket from './Bucket';
import { METRICS, CATEGORIES, STACKS } from '../../constants/bucket';

export default class BucketsPanel extends Component {
    static propTypes = {
        visualizationType: PropTypes.string.isRequired,
        buckets: PropTypes.object
    };

    static defaultProps = {
        buckets: Map()
    };

    renderBucket(keyName) {
        const { buckets, visualizationType } = this.props;
        const bucket = buckets.get(keyName);
        return bucket && bucket.get('enabled') ?
            <Bucket
                key={keyName}
                buckets={buckets}
                visualizationType={visualizationType}
                bucket={bucket}
            /> : false;
    }

    render() {
        return (
            <div className="adi-bucket-list">
                {this.renderBucket(METRICS)}
                {this.renderBucket(CATEGORIES)}
                {this.renderBucket(STACKS)}
            </div>
        );
    }
}

import React, { Component, PropTypes } from 'react';
import pureRender from 'pure-render-decorator';

import { injectIntl } from 'react-intl';

import AggregationSelect from '../shared/AggregationSelect';
import CatalogueItem from '../catalogue/CatalogueItem';
import MetricFilters from './metrics/MetricFilters';
import ConfigurationCheckboxes from './metric/ConfigurationCheckboxes';

import { AGGREGATION_FUNCTIONS } from '../../models/aggregation_function';

@pureRender
class MetricBucketItemConfiguration extends Component {
    static propTypes = {
        bucketItem: PropTypes.object.isRequired,
        onSetAttributeAggregation: PropTypes.func,
        onShowBubble: PropTypes.func
    };

    aggregationFunctions() {
        return AGGREGATION_FUNCTIONS.filter(func =>
            func.applicableTo === this.props.bucketItem.getIn(['attribute', 'type'])
        );
    }

    renderAggregation(props) {
        let bucketItem = props.bucketItem,
            attribute = bucketItem.get('attribute'),
            t = props.intl.formatMessage;
        return (
            <div className="adi-aggregation-wrapper">
                {attribute && attribute.get('type') === 'fact' ?
                    <div className="adi-bucket-select">
                        <AggregationSelect
                            className="s-fact-aggregation-switch"
                            aggregationFunctions={this.aggregationFunctions()}
                            aggregation={bucketItem.get('aggregation')}
                            onSelect={aggregation => props.onSetAttributeAggregation(bucketItem.get('original'), aggregation)}
                        />
                        <span>{t({ id: 'of' })}</span>
                    </div> :
                    false
                }
                {attribute && attribute.get('type') === 'attribute' ?
                    <span>{t({ id: 'aggregations.title.COUNT' })} {t({ id: 'of' })}</span> : false
                }
                <CatalogueItem
                    item={attribute}
                    draggable={false}
                    available
                    onShowBubble={props.onShowBubble}
                />
            </div>
        );
    }

    render() {
        let props = this.props,
            bucketItem = props.bucketItem;

        return (
            <div className="adi-bucket-configuration adi-metric-bucket-item-configuration">
                {this.renderAggregation(props)}
                <MetricFilters bucketItem={bucketItem} onShowBubble={props.onShowBubble} />
                <ConfigurationCheckboxes bucketItem={bucketItem} />
            </div>
        );
    }
}

export default injectIntl(MetricBucketItemConfiguration);

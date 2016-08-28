import React, { Component, PropTypes } from 'react';
import { List } from 'immutable';
import { bindAll } from 'lodash';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import * as BucketActions from '../../../actions/buckets_actions';
import * as DataActions from '../../../actions/data_actions';
import * as ElementActions from '../../../actions/attribute_elements_actions';
import metricFilterSelector from '../../../selectors/metric_filters_selector';

import MetricAttributeFilter from '../MetricAttributeFilter';
import Button from 'Button/ReactButton';
import AttributeFilter from '../AttributeFilter';

import createDataSource from '../../../services/attributes_data_source';
import { getMetricMDObject } from '../../../services/metadata_service';

export class MetricFilters extends Component {
    static propTypes = {
        bucketItem: PropTypes.object.isRequired,
        elements: PropTypes.object,
        projectId: PropTypes.string.isRequired,
        setBucketItemAddMetricFilter: PropTypes.func.isRequired,
        setBucketItemRemoveMetricFilter: PropTypes.func.isRequired,
        setBucketItemUpdateMetricFilter: PropTypes.func.isRequired,
        loadAttributeElements: PropTypes.func.isRequired
    };

    constructor() {
        super();

        this.state = {
            autoOpenAttributeFilter: false
        };

        bindAll(this, [
            'onCreateDataSource',
            'onAddAttributeFilter',
            'onUpdateAttributeFilter',
            'onRemoveAttributeFilter'
        ]);
    }

    onCreateDataSource() {
        const { projectId, bucketItem } = this.props;

        return createDataSource(projectId, getMetricMDObject(bucketItem));
    }

    onAddAttributeFilter(attribute) {
        const { bucketItem } = this.props;

        const item = bucketItem.get('original');

        this.props.setBucketItemAddMetricFilter({ item, attribute });

        this.setState({ autoOpenAttributeFilter: true });
    }

    onUpdateAttributeFilter(filter, changes) {
        const { bucketItem } = this.props;

        const item = bucketItem.get('original');

        this.props.setBucketItemUpdateMetricFilter({ item, filter: filter.get('original'), changes });

        this.setState({ autoOpenAttributeFilter: false });
    }

    onRemoveAttributeFilter(filter) {
        const item = this.props.bucketItem.get('original');

        this.props.setBucketItemRemoveMetricFilter({ item, filter });
    }

    renderAttributeFilters(filters) {
        return (
            <section className="attribute-filters-wrapper">
                <h2><FormattedMessage id="filters" /></h2>
                {filters.map((filter, idx) => {
                    let uri = filter.getIn(['attribute', 'dfUri']);

                    return (
                        <div key={idx} className="metric-attribute-filter-wrapper">
                            <AttributeFilter
                                autoOpen={this.state.autoOpenAttributeFilter}
                                filter={filter}
                                elements={this.props.elements}
                                onLoadAttributeElements={(...args) => this.props.loadAttributeElements(uri, ...args)}
                                onApply={(...args) => this.onUpdateAttributeFilter(filter, ...args)}
                            />

                            <Button
                                className="button-link button-icon-only icon-cross remove-attribute-filter s-remove-attribute-filter"
                                onClick={() => this.onRemoveAttributeFilter(filter.get('original'))}
                            />
                        </div>
                    );
                }).toJS()}
            </section>
        );
    }

    renderAttributePicker() {
        const props = this.props;
        return (
            <section className="attribute-filters-wrapper">
                <MetricAttributeFilter
                    bucketItem={props.bucketItem}
                    dataSourceCreator={this.onCreateDataSource}
                    onSelect={this.onAddAttributeFilter}
                />
            </section>
        );
    }

    render() {
        const filters = this.props.bucketItem.get('filters') || List();

        if (filters.size) {
            return this.renderAttributeFilters(filters);
        }

        return this.renderAttributePicker();
    }
}

const actions = { ...DataActions, ...BucketActions, ...ElementActions };

export default connect(metricFilterSelector, actions)(injectIntl(MetricFilters));

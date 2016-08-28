import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import pureRender from 'pure-render-decorator';
import { bindAll } from 'lodash';
import classNames from 'classnames';

import { FILTERS } from '../constants/bucket';

import * as Actions from '../actions/buckets_actions';
import { loadAttributeElements } from '../actions/attribute_elements_actions';

import FilterBucketHeader from '../components/filterBucket/FilterBucketHeader';
import FilterBucketList from '../components/filterBucket/FilterBucketList';

import { filterBucketSelector } from '../selectors/buckets_selector';

@pureRender
export class FilterBucket extends Component {
    static propTypes = {
        buckets: PropTypes.object.isRequired,
        visualizationType: PropTypes.string.isRequired,
        elements: PropTypes.object.isRequired,
        timezoneOffset: PropTypes.number.isRequired,
        dispatch: PropTypes.func.isRequired
    };

    constructor() {
        super();
        bindAll(this, ['onLoadAttributeElements', 'onUpdateAttributeFilter']);
    }

    onLoadAttributeElements(...args) {
        this.props.dispatch(loadAttributeElements(...args));
    }

    onUpdateAttributeFilter(item, filter, changes) {
        this.props.dispatch(Actions.setBucketItemUpdateFilter({ item, filter, changes }));
    }

    getClasses() {
        let isEmpty = this.props.buckets.getIn([FILTERS, 'items']).size === 0;

        return classNames(
            'adi-bucket',
            'adi-filter-bucket',
            's-bucket-filters',
            {
                's-bucket-empty': isEmpty,
                's-bucket-not-empty': !isEmpty
            }
        );
    }

    render() {
        return (
            <div className={this.getClasses()}>
                <FilterBucketHeader />
                <FilterBucketList
                    {...this.props}
                    bucket={this.props.buckets.get(FILTERS)}
                    onLoadAttributeElements={this.onLoadAttributeElements}
                    onUpdateAttributeFilter={this.onUpdateAttributeFilter}
                />
            </div>
        );
    }
}

export default connect(filterBucketSelector)(FilterBucket);

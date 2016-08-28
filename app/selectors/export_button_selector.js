import { createSelector } from 'reselect';
import * as StatePaths from '../constants/StatePaths';
import { getDecoratedBuckets, areBucketsEmpty } from './buckets_selector';
import { isEqual } from 'lodash';
import {
    isInvalidConfigurationSelector,
    isReportEmptySelector,
    isReportMissingMetric,
    isReportTooLargeSelector,
    isExecutionRunningSelector
} from './report_selector';
import * as BucketTypes from '../constants/bucket';

import { bucketItemBase } from '../models/bucket_item';

function hasReportError(state) {
    return isInvalidConfigurationSelector(state) ||
        isReportEmptySelector(state) ||
        isReportMissingMetric(state) ||
        isReportTooLargeSelector(state) ||
        isExecutionRunningSelector(state);
}

export const getMetricBase = metric => {
    return Object.keys(bucketItemBase).reduce((result, propKey) => {
        return {
            ...result,
            [propKey]: metric.get(propKey)
        };
    }, {});
};

function findDuplicatedMetric(decoratedBuckets) {
    const items = decoratedBuckets.get(BucketTypes.METRICS).get('items');
    const isMetricEqual = (metric, other) =>
        isEqual(getMetricBase(metric), getMetricBase(other));

    return items.find((i1, k1) =>
        items.find((i2, k2) => isMetricEqual(i1, i2) && k1 !== k2)
    );
}

function findDuplicatedAttribute(decoratedBuckets) {
    const stack = decoratedBuckets.get(BucketTypes.STACKS).get('items').first();
    const category = decoratedBuckets.get(BucketTypes.CATEGORIES).get('items').first();
    if (stack && category && stack.get('attribute') === category.get('attribute')) {
        return stack;
    }

    return null;
}

function getDuplicatedBucketItem(decoratedBuckets) {
    return findDuplicatedMetric(decoratedBuckets) ||
        findDuplicatedAttribute(decoratedBuckets);
}

function isReportSaving(state) {
    return state.getIn(StatePaths.REPORT_SAVING);
}
export default createSelector(
    getDecoratedBuckets,
    hasReportError,
    isReportSaving,
    (decoratedBuckets, reportError, reportSaving) => {
        const duplicatedBucketItem = getDuplicatedBucketItem(decoratedBuckets);
        const duplicatedObject = duplicatedBucketItem ?
            duplicatedBucketItem.get('attribute') : null;
        const isExportDisabled = reportError || !!duplicatedObject ||
            areBucketsEmpty(decoratedBuckets) || reportSaving;
        return {
            duplicatedObject,
            isExportDisabled
        };
    }
);

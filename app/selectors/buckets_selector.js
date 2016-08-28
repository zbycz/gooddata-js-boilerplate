import { createSelector } from 'reselect';

import * as Paths from '../constants/StatePaths';

import { decoratedDateDataSets } from '../models/date_dataset';
import { decoratedBuckets } from '../models/bucket';
import { bucketsToMetadata } from '../models/metadata';

import { getProjectTimezoneOffset } from './bootstrap_selector';

import * as BucketTypes from '../constants/bucket';

const getElements = state => state.getIn(Paths.ATTRIBUTE_ELEMENTS);

export const getBucketItems = (state, keyName) => state.getIn([...Paths.BUCKETS, keyName, 'items']);

export const getItemBucket = (state, index) => {
    const categoriesCount = state.getIn(Paths.BUCKETS_CATEGORIES_ITEMS).size;

    return index < categoriesCount ? BucketTypes.CATEGORIES : BucketTypes.METRICS;
};

export const getCategoryPath = (state, index) => {
    const categories = state.getIn(Paths.BUCKETS_CATEGORIES);

    // table has columns first from categories (in same order as they are in 'items' array)
    // categories items can have only one column
    // if table column index is smaller than size of categories.items array, than we have our new index
    const categoriesCount = categories.get('items').size;
    if (index < categoriesCount) {
        return [...Paths.BUCKETS_CATEGORIES_ITEMS, index];
    }
    return null;
};

export const getMeasurePath = (state, index) => {
    const metrics = state.getIn(Paths.BUCKETS_METRICS_ITEMS);

    // Go through all metrics and adjust the index. Metric with showPoP flag
    // have two columns in table, first column is PoP column and second one
    // has current values. There can be only single metric with PoP.
    const resultIndex = metrics.reduce((acc, metric, idx) => {
        if (metric.get('showPoP')) {
            if (index === idx + 1) {
                return acc - 1;
            }
        }
        return acc;
    }, index);

    return [...Paths.BUCKETS_METRICS_ITEMS, resultIndex];
};

export const getItemPath = (state, index) => {
    const categoryPath = getCategoryPath(state, index);
    if (categoryPath) {
        return categoryPath;
    }

    const categories = state.getIn(Paths.BUCKETS_CATEGORIES);
    let metricsIndex = index - categories.get('items').size;

    return getMeasurePath(state, metricsIndex);
};

export const getItem = (state, index) => {
    const path = getItemPath(state, index);
    return state.getIn(path);
};

export const getItemCache = state => state.getIn(Paths.ITEM_CACHE);
export const getDateDataSets = state => state.getIn(Paths.DATE_DATASETS);
export const getBuckets = state => state.getIn(Paths.BUCKETS);
export const getVisualizationType = state => state.getIn(Paths.VISUALIZATION_TYPE);

export const getDecoratedDateDataSets = createSelector(getDateDataSets, decoratedDateDataSets);

export const getDecoratedBuckets = createSelector(
    getBuckets,
    getItemCache,
    getDecoratedDateDataSets,
    getVisualizationType,
    (buckets, itemCache, dateDataSets, visualizationType) =>
        decoratedBuckets(buckets, itemCache, dateDataSets, visualizationType)
);

function isBucketEmpty(bucket) {
    return bucket.get('items').size === 0;
}

export function areBucketsEmpty(buckets) {
    const isEmptyMetricsBucket = isBucketEmpty(buckets.get(BucketTypes.METRICS));
    const isEmptyCategoriesBucket = isBucketEmpty(buckets.get(BucketTypes.CATEGORIES));
    const isEmptyStacksBucket = isBucketEmpty(buckets.get(BucketTypes.STACKS));
    const isEmptyFiltersBucket = isBucketEmpty(buckets.get(BucketTypes.FILTERS));

    return isEmptyMetricsBucket && isEmptyCategoriesBucket && isEmptyStacksBucket && isEmptyFiltersBucket;
}

export const getAttributeElements = createSelector(
    getElements,
    elements => {
        let itemsArray = elements.get('items').reduce((memo, item, idx) => {
            memo[idx] = item;
            return memo;
        }, []); // generate sparse array

        return elements.set('items', itemsArray).delete('query');
    }
);

export const bucketsSelector = createSelector(
    getDecoratedBuckets,
    getVisualizationType,

    (buckets, visualizationType) =>
        ({ buckets, visualizationType })
);

export const filterBucketSelector = createSelector(
    getDecoratedBuckets,
    getVisualizationType,
    getDecoratedDateDataSets,
    getAttributeElements,
    getProjectTimezoneOffset,

    (buckets, visualizationType, dateDataSets, elements, timezoneOffset) =>
        ({ buckets, visualizationType, dateDataSets, elements, timezoneOffset })
);

export const currentReportMDObject = createSelector(
    getVisualizationType,
    getDecoratedBuckets,

    (type, buckets) => ({ type, buckets: bucketsToMetadata(type, buckets.delete('original').toJS()) })
);

import { List, Record, fromJS } from 'immutable';

import { t } from '../utils/translations';
import { shortenText } from '../utils/base';

import { AGGREGATION_FUNCTIONS } from './aggregation_function';
import { decoratedMetricAttributeFilter, isModified } from './metric_attribute_filter';
import { createDateItem, DATE_DATASET_ATTRIBUTE } from './date_item';

import { METRICS, FILTERS } from '../constants/bucket';
import invariant from 'invariant';

const MAX_TITLE_LENGTH = 255;

export const bucketItemBase = {
    attribute: null,
    filters: [],
    aggregation: null,
    showInPercent: false,
    showPoP: false,
    granularity: null
};

export const bucketItemExtended = {
    ...bucketItemBase,
    collapsed: true,
    isAutoCreated: false,
    sort: null
};

export function buildBucketItem(props) {
    return { ...bucketItemExtended, ...props };
}

export function bucketItem(props) {
    return fromJS(buildBucketItem(props));
}

const DecoratedBucketItem = Record({
    ...bucketItemExtended,
    isMetric: false,
    isFilter: false,
    isDate: false,
    original: null,
    dateDataSet: null,
    metricTitle: null,
    metricAxisLabel: null,
    uri: null,
    format: null,
    seleniumClass: null,
    sort: null
});

export function getAttribute(item, itemCache) {
    const attribute = item.get('attribute');
    if (attribute === DATE_DATASET_ATTRIBUTE) {
        return createDateItem();
    }

    const cachedItem = itemCache.get(attribute);

    invariant(cachedItem, `Item ${attribute} was not found in cache.`);

    return cachedItem;
}

function isDate(item) {
    return item.getIn(['attribute', 'identifier']) === DATE_DATASET_ATTRIBUTE;
}

function isMetric(bucket) {
    return bucket.get('keyName') === METRICS;
}
function isFilter(bucket) {
    return bucket.get('keyName') === FILTERS;
}

export function hasModifiedFilter(item) {
    return (item.get('filters') || List()).some(isModified);
}

function getDateDataSet(item, dateDataSets) {
    if (item.getIn(['attribute', 'type']) !== 'date') {
        return null;
    }

    return dateDataSets.get('dateDataSet');
}

function getGranularityId(item) {
    if (item.get('isFilter')) {
        const interval = item.getIn(['filters', 0, 'interval']);
        return interval ? interval.get('granularity') : null;
    }

    return item.get('granularity');
}

function getGranularity(item) {
    if (item.getIn(['attribute', 'type']) !== 'date') {
        return null;
    }

    let dateDataSet = item.get('dateDataSet'),
        granularityId = getGranularityId(item);

    return dateDataSet ?
        dateDataSet.get('attributes')
            .findLast(granularity =>
                !granularityId || granularity.get('dateType') === granularityId) || null :
        null;
}

function getAggregation(item) {
    const attribute = item.get('attribute') || fromJS({});
    const funcs = AGGREGATION_FUNCTIONS.filter(func => func.applicableTo === attribute.get('type'));

    return funcs.length ? item.get('aggregation') || funcs[0].functionName : null;
}

function getMetricTitle(item) {
    let title = item.getIn(['attribute', 'title']);
    const aggregation = item.get('aggregation');

    if (aggregation) {
        title = t(`aggregations.metric_title.${aggregation}`, { title });
    }
    if (item.get('showInPercent')) {
        title = `% ${title}`;
    }

    return title;
}

function getFilters(item, itemCache, dateDataSets) {
    return item.get('filters').map(
        filter => decoratedMetricAttributeFilter(filter, itemCache, dateDataSets)
    );
}

function getMetricAxisLabel(item) {
    const metricTitle = item.get('metricTitle');
    const maxLength = { maxLength: MAX_TITLE_LENGTH - metricTitle.length };
    const filters = (item.get('filters') || List())
        .filterNot(filter => filter.get('allSelected'))
        .map(filter => filter.get('title'))
        .join(', ');

    return metricTitle + (filters ? `${shortenText(filters, maxLength)}` : '');
}

function getUri(item) {
    if (item.getIn(['attribute', 'type']) === 'date') {
        return item.getIn(['granularity', 'uri']);
    }

    return item.getIn(['attribute', 'uri']);
}

function getFormat(item) {
    return item.getIn(['attribute', 'format']) || '#,##0.00';
}

export function decoratedBucketItem(item, bucket, itemCache, dateDataSets) {
    return new DecoratedBucketItem(item.withMutations(mutable =>
        mutable
            .set('original', item)
            .set('attribute', getAttribute(item, itemCache)) // order of mutations is important!
            .set('isDate', isDate(mutable))
            .set('isMetric', isMetric(bucket))
            .set('isFilter', isFilter(bucket))
            .set('hasModifiedFilter', hasModifiedFilter(mutable))
            .set('dateDataSet', getDateDataSet(mutable, dateDataSets))
            .set('granularity', getGranularity(mutable, dateDataSets))
            .set('aggregation', getAggregation(mutable))
            .set('metricTitle', getMetricTitle(mutable))
            .set('filters', getFilters(mutable, itemCache, dateDataSets))
            .set('metricAxisLabel', getMetricAxisLabel(mutable))
            .set('uri', getUri(mutable))
            .set('format', getFormat(mutable))
    ));
}

import {
    includes,
    partial,
    partialRight,
    get,
    find,
    fromPairs,
    map,
    matchesProperty,
    negate,
    flow,
    mapValues,
    values,
    flatten,
    groupBy,
    pickBy,
    isUndefined
} from 'lodash';
import invariant from 'invariant';

import { METRICS, CATEGORIES, STACKS, FILTERS } from '../constants/bucket';
import { buildBucketItem } from './bucket_item';
import { applyBarSort, removeEmptySortProperties } from './metadata/sort';
import { typedObject } from '../utils/object';

import { DATE_DATASET_ATTRIBUTE } from './date_item';
import { ALL_TIME } from '../constants/presets';

const isDefined = negate(isUndefined);
const pickDefined = partialRight(pickBy, isDefined);

const factToMd = (filterTransformer, fact) => typedObject('measure', pickDefined({
    type: 'fact',
    aggregation: get(fact, 'aggregation').toLowerCase(),
    objectUri: get(fact, 'attribute.uri'),
    title: get(fact, 'metricAxisLabel'), // TODO is not currently stored in MD - MD needs update
    format: get(fact, 'format'), // TODO is not currently stored in MD - MD needs update
    measureFilters: map(get(fact, 'filters', []), filterTransformer),
    showInPercent: get(fact, 'showInPercent'),
    showPoP: get(fact, 'showPoP'),
    sort: get(fact, 'sort')
}));

const attributeToMetricMd = (filterTransformer, attribute) => typedObject('measure', pickDefined({
    type: 'attribute',
    aggregation: get(attribute, 'aggregation').toLowerCase(),
    objectUri: get(attribute, 'attribute.uri'),
    title: get(attribute, 'metricAxisLabel'), // TODO is not currently stored in MD - MD needs update
    format: get(attribute, 'format'), // TODO is not currently stored in MD - MD needs update
    measureFilters: map(get(attribute, 'filters', []), filterTransformer),
    showInPercent: get(attribute, 'showInPercent'),
    showPoP: get(attribute, 'showPoP'),
    sort: get(attribute, 'sort')
}));

const metricToMd = (filterTransformer, metric) => typedObject('measure', pickDefined({
    type: 'metric',
    objectUri: get(metric, 'attribute.uri'),
    title: get(metric, 'metricAxisLabel'),
    format: get(metric, 'format'),
    measureFilters: map(get(metric, 'filters', []), filterTransformer),
    showInPercent: get(metric, 'showInPercent'),
    showPoP: get(metric, 'showPoP'),
    sort: get(metric, 'sort')
}));

const collectionsByBucketAndVisType = {
    [CATEGORIES]: {
        'table': 'attribute',
        'column': 'view',
        'bar': 'view',
        'line': 'trend'
    },
    [STACKS]: {
        'column': 'stack',
        'bar': 'stack',
        'line': 'segment'
    }
};

const attributeToMd = (attribute, keyName, visType) => typedObject('category', {
    type: 'attribute',
    collection: collectionsByBucketAndVisType[keyName][visType],
    attribute: get(attribute, 'attribute.uri'),
    displayForm: get(attribute, 'attribute.dfUri'),
    sort: get(attribute, 'sort')
});

const dateDataSetToMd = (dateDataSet, keyName, visType) => typedObject('category', {
    type: 'date',
    collection: collectionsByBucketAndVisType[keyName][visType],
    displayForm: get(dateDataSet, 'granularity.dfUri'),
    attribute: get(find(get(dateDataSet, 'dateDataSet.attributes'), matchesProperty('dateType', 'GDC.time.year')), 'uri'),
    sort: get(dateDataSet, 'sort')
});

const filterToMd = filter => typedObject('listAttributeFilter', {
    attribute: get(filter, 'attribute.uri'),
    displayForm: get(filter, 'attribute.dfUri'),
    'default': {
        negativeSelection: !!filter.isInverted,
        attributeElements: map(get(filter, 'selectedElements', []), 'uri')
    }
});

const attributeFilterToMd = flow(
    attribute => get(attribute, 'filters.0'),
    filterToMd
);

const dateFilterToMd = filter => typedObject('dateFilter', pickDefined({
    type: get(filter, 'filters.0.interval.isStatic') ? 'absolute' : 'relative',
    from: get(filter, 'filters.0.interval.interval.0'),
    to: get(filter, 'filters.0.interval.interval.1'),
    granularity: get(filter, 'granularity.dateType'),
    dataset: get(filter, 'dateDataSet.uri'),
    attribute: get(
        find(
            get(filter, 'dateDataSet.attributes'),
            matchesProperty('dateType', get(filter, 'granularity.dateType'))
        ),
        'uri'
    )
}));

const measureMappers = {
    fact: partial(factToMd, filterToMd),
    metric: partial(metricToMd, filterToMd),
    attribute: partial(attributeToMetricMd, filterToMd)
};

const categoryMappers = {
    attribute: attributeToMd,
    date: dateDataSetToMd
};

const filterMappers = {
    attribute: attributeFilterToMd,
    date: dateFilterToMd
};

const applyMapperToItemByType = (mappers, item, name, visType, idx) =>
    mappers[get(item, 'attribute.type')](item, name, visType, idx);

const categoryTransformer = partial(applyMapperToItemByType, categoryMappers);
const measureTransformer = partial(applyMapperToItemByType, measureMappers);
const filterTransformer = partial(applyMapperToItemByType, filterMappers);

const bucketMappers = {
    measures: measureTransformer,
    categories: categoryTransformer,
    filters: filterTransformer,
    stacks: categoryTransformer
};

const transformBucket = (visType, [name, items]) =>
    [name, map(items, (item, idx) => bucketMappers[name](item, name, visType, idx))];

const bucketsToPairs = buckets => map(buckets, bucket => [bucket.keyName, bucket.items]);

const renameMetrics = buckets =>
    map(buckets, ([name, items]) => [(name === METRICS) ? 'measures' : name, items]);

const transformBuckets = (visType, buckets) => map(buckets, partial(transformBucket, visType));

const mergeBuckets = (visType, buckets) => ({
    measures: buckets.measures,
    [CATEGORIES]: visType !== 'table' ? [...buckets[CATEGORIES], ...buckets[STACKS]] : buckets[CATEGORIES],
    [FILTERS]: buckets[FILTERS]
});

export const bucketsToMetadata = (visualizationType, buckets) =>
    flow(
        values,
        bucketsToPairs,
        renameMetrics,
        partial(transformBuckets, visualizationType),
        fromPairs,
        partial(mergeBuckets, visualizationType),
        partial(applyBarSort, visualizationType),
        removeEmptySortProperties
    )(buckets);

const renameMeasures = ({ metadataObject, additionalData }) => ({
    metadataObject: Object.keys(metadataObject).reduce((acc, key) => {
        const storeKey = key === 'measures' ? METRICS : key;
        acc[storeKey] = metadataObject[key];
        return acc;
    }, {}),
    additionalData
});

const convertToBucket = (items, keyName) => ({ keyName, items });

const convertToBuckets = ({ metadataObject }) => mapValues(metadataObject, convertToBucket);

const transformFilterItem = item => buildBucketItem(pickDefined({
    attribute: get(item, 'attribute'),
    dateDataSet: get(item, 'dateDataSet'),
    granularity: get(item, ['interval', 'granularity']),
    filters: [{ ...item, isModified: true }]
}));

const transformItem = item => buildBucketItem(pickDefined({
    aggregation: item.aggregation && item.aggregation.toUpperCase(),
    attribute: item.identifier,
    filters: item.filters,
    showPoP: item.showPoP,
    showInPercent: item.showInPercent,
    granularity: item.dateType,
    sort: item.sort
}));

const isFilter = item => !!item.allElements;

const transformBucketItem = item => (isFilter(item) ? transformFilterItem(item) : transformItem(item));

const isCacheItemMatching = (item, cacheItem) => cacheItem.uri === (item.objectUri || item.attribute);

const isDimensionItemMatching = (item, dimensionItem) => item.displayForm === dimensionItem.dfUri;

const findItemInCache = (item, cache) => find(cache, cacheItem => isCacheItemMatching(item, cacheItem));

const findItemInDimensions = (item, dimensions) => {
    const availableDimensions = get(dimensions, 'available');
    const allAttributes = flatten(map(availableDimensions, 'attributes'));

    return { ...find(allAttributes, partial(isDimensionItemMatching, item)), identifier: DATE_DATASET_ATTRIBUTE };
};

const processAttributeFilter = (filterItem, data) => {
    const attributeFromCache = findItemInCache(filterItem, data.itemCache);

    invariant(attributeFromCache, `Attribute '${filterItem.attribute}' was not found in the cache`);

    const attributeElements = get(data, ['filterItems', filterItem.displayForm, 'items']);
    const attributeElementsCount = get(data, ['filterItems', filterItem.displayForm, 'total']);

    const selectedUris = get(filterItem, ['default', 'attributeElements'], []);
    const attributeElementsValues = values(attributeElements);

    return {
        allElements: attributeElements,
        selectedElements: selectedUris.map(uri => {
            let item = attributeElementsValues.find(attributeElement => attributeElement.uri === uri);
            if (item) { return item; }
            // preserve unavailable elements, they could be after next upload available
            return { uri, available: false };
        }),
        isInverted: !!get(filterItem, ['default', 'negativeSelection'], false),
        attribute: attributeFromCache.identifier,
        totalElementsCount: attributeElementsCount
    };
};

const findDimensionIdentifier = (filterItem, data) => {
    const dimensionUri = filterItem.dataset;
    const itemDimension = data.available.find(dimension => dimension.uri === dimensionUri);
    return get(itemDimension, 'identifier'); // dateDataSet may not be available
};

const processDateFilter = (filterItem, data) => {
    const dimension = findDimensionIdentifier(filterItem, data.dateDataSets);

    let interval = { name: ALL_TIME };
    if (filterItem.from !== undefined && filterItem.to !== undefined) {
        interval = {
            'granularity': filterItem.granularity,
            'interval': [
                filterItem.from,
                filterItem.to
            ]
        };
    }

    return {
        'attribute': DATE_DATASET_ATTRIBUTE,
        'allElements': [],
        'selectedElements': [],
        'isInverted': true,
        'totalElementsCount': 0,
        dimension,
        interval
    };
};

const processCategory = (flattenItem, data) => {
    if (flattenItem.type === 'date') {
        return { ...flattenItem, ...findItemInDimensions(flattenItem, data.dateDataSets) };
    }

    return { ...flattenItem, ...findItemInCache(flattenItem, data.itemCache) };
};

const processMeasure = (flattenItem, data) => ({
    ...flattenItem, ...findItemInCache(flattenItem, data.itemCache),
    filters: map(flattenItem.measureFilters, filter => processAttributeFilter(filter.listAttributeFilter, data))
});

const processors = {
    listAttributeFilter: processAttributeFilter,
    dateFilter: processDateFilter,
    measure: processMeasure,
    category: processCategory
};

const enrichBucketItem = (item, data) => {
    const key = Object.keys(item)[0];
    const flattenItem = item[key];

    return processors[key](flattenItem, data);
};

const enrichBucketItems = (items, data) =>
    items.map(item => enrichBucketItem(item, data));


const transformBucketItems = flow(
    enrichBucketItems,
    partialRight(map, transformBucketItem)
);

const isStacksBucket = bucket => {
    const collectionName = bucket.category.collection;

    return includes(values(collectionsByBucketAndVisType[STACKS]), collectionName);
};

const transformStacks = ({ metadataObject, additionalData }) => {
    const updatedBuckets = {
        stacks: [],
        categories: [],
        ...groupBy(metadataObject.categories, bucket => (isStacksBucket(bucket) ? STACKS : CATEGORIES))
    };

    return {
        metadataObject: { ...metadataObject, ...updatedBuckets },
        additionalData
    };
};

const transformBucketsItems = ({ metadataObject, additionalData }) => ({
    metadataObject: mapValues(metadataObject, bucketItems =>
        transformBucketItems(bucketItems, additionalData)),
    additionalData
});

export const metadataToBuckets = flow(
    transformStacks,
    renameMeasures,
    transformBucketsItems,
    convertToBuckets
);

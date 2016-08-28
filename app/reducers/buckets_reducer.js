import { List } from 'immutable';
import { get, identity, difference, includes } from 'lodash';

import * as Actions from '../constants/Actions';
import * as Paths from '../constants/StatePaths';

import { isAllowedToAdd, isShowInPercentValid, isShowPoPValid } from '../models/bucket_rules';
import { bucketItem as bucketItemFactory } from '../models/bucket_item';
import { DATE_DATASET_ATTRIBUTE, createDateItem } from '../models/date_item';
import { metricAttributeFilter, isModified } from '../models/metric_attribute_filter';

import { METRICS, CATEGORIES, STACKS, FILTERS } from '../constants/bucket';
import { getBucketItems } from '../selectors/buckets_selector';
import { updateSortInfo } from '../utils/sort';

function getItemsPath(keyName) {
    return [...Paths.BUCKETS, keyName, 'items'];
}

function isDateItem(item) {
    return item.get('attribute') === DATE_DATASET_ATTRIBUTE ||
        item.get('identifier') === DATE_DATASET_ATTRIBUTE;
}

function getCatalogueItem(state, bucketItem) {
    return isDateItem(bucketItem) ?
        createDateItem() : state.getIn([...Paths.ITEM_CACHE, bucketItem.get('attribute')]);
}

function getIsAllowedToAdd(state, keyName, bucketItem) {
    let visualizationType = state.getIn(Paths.VISUALIZATION_TYPE),
        buckets = state.getIn(Paths.BUCKETS),
        item = getCatalogueItem(state, bucketItem);

    return isAllowedToAdd(visualizationType, buckets, { to: keyName, item });
}

export function addItems(state, keyName, items) {
    let path = getItemsPath(keyName);

    return items.reduce((newState, bucketItem) => {
        if (getIsAllowedToAdd(newState, keyName, bucketItem)) {
            return newState.setIn(path, newState.getIn(path).push(bucketItem));
        }
        return newState;
    }, state);
}

function clearItems(state, keyName) {
    return state.setIn(getItemsPath(keyName), List());
}

function setItems(state, keyName, items) {
    return addItems(clearItems(state, keyName), keyName, items);
}

function transitionToTable(state) {
    let stacksItems = getBucketItems(state, STACKS);

    // move first item to categories
    if (stacksItems.size) {
        const firstStackItem = stacksItems.first();
        return addItems(clearItems(state, STACKS), CATEGORIES, List([firstStackItem]));
    }

    return state;
}

function skipFirst(item, idx) {
    return idx > 0;
}

function removeUneditedFilters(state, attributes) {
    const isFilterUnrelated = item => !item.get('isAutoCreated');
    const isFilterModified = item => isModified(item.getIn([FILTERS, 0]));

    return state.setIn(
        Paths.BUCKETS_FILTERS_ITEMS,
        state.getIn(Paths.BUCKETS_FILTERS_ITEMS)
            .filter(item => !includes(attributes, item.get('attribute')) || isFilterUnrelated(item) || isFilterModified(item))
    );
}

function moveToStackAndCleanCategory(state, filter = skipFirst) {
    let categoryItems = getBucketItems(state, CATEGORIES);

    let itemsToDistribute = categoryItems.filter(filter),
        itemToStacks = itemsToDistribute.find(bucketItem => getIsAllowedToAdd(state, STACKS, bucketItem)),
        itemsToLeave = List(difference(categoryItems.toArray(), itemsToDistribute.toArray())),
        attributesToRemove = difference(itemsToDistribute.toArray(), [itemToStacks]).map(item => item.get('attribute')),
        newState = state;

    if (attributesToRemove.length) {
        newState = removeUneditedFilters(newState, attributesToRemove);
    }

    if (itemToStacks) {
        newState = addItems(newState, STACKS, List([itemToStacks]));
    }

    return setItems(newState, CATEGORIES, itemsToLeave);
}

function transitionToLine(state) {
    if (getBucketItems(state, CATEGORIES).find(isDateItem)) {
        return moveToStackAndCleanCategory(state, item => !isDateItem(item));
    }

    return moveToStackAndCleanCategory(state);
}

const transitionMatrix = {
    table: {
        bar: moveToStackAndCleanCategory,
        column: moveToStackAndCleanCategory,
        line: transitionToLine
    },
    bar: { table: transitionToTable },
    column: { table: transitionToTable },
    line: { table: transitionToTable }
};

function updateBuckets(state, from, to) {
    return (get(transitionMatrix, [from, to]) || identity)(state);
}

function selectVisualizationType(state, type) {
    let fromType = state.getIn(Paths.VISUALIZATION_TYPE);

    let newState = state.setIn(Paths.VISUALIZATION_TYPE, type);

    newState = updateBuckets(newState, fromType, type);

    return updateSortInfo(newState);
}

function getBucketItemIndex(state, item) {
    let index,
        bucket = state.getIn(Paths.BUCKETS).find(b => {
            index = b.get('items').findIndex(bucketItem => bucketItem === item);
            return index >= 0;
        });

    return { bucket, index };
}

export function getBucketKeyName(state, item) {
    let { bucket } = getBucketItemIndex(state, item);
    return bucket && bucket.get('keyName');
}

export function getBucketItemPath(state, item) {
    let { bucket, index } = getBucketItemIndex(state, item);
    return bucket && [...getItemsPath(bucket.get('keyName')), index];
}

function setBucketItemCollapsed(state, { item, collapsed }) {
    let bucketKeyName = getBucketKeyName(state, item),
        itemsPath = getItemsPath(bucketKeyName);

    return bucketKeyName === METRICS ?
        state.setIn(
            itemsPath,
            state.getIn(itemsPath).map(bucketItem =>
                bucketItem.set('collapsed', bucketItem === item ? collapsed : true)
            )
        ) :
        state;
}

function setBucketItemProperty(property, state, { item, value }) {
    let itemPath = getBucketItemPath(state, item);

    return state.setIn([...itemPath, property], value);
}

function setDateDataSet(state, { value }) {
    return state.setIn(Paths.DATE_DATASETS_SELECTED, value);
}

export function filterBucketItem({ attribute, interval, isAutoCreated }) {
    return bucketItemFactory({
        attribute,
        isAutoCreated,
        filters: [metricAttributeFilter({ attribute, interval })] }
    );
}

function isCategoriesOrStacks(keyName) {
    return includes([CATEGORIES, STACKS], keyName);
}

function removeDateDataSet(state) {
    return state.setIn(Paths.DATE_DATASETS_SELECTED, null);
}

function isNoDateSelected(state) {
    return state.getIn(Paths.DATE_DATASETS_SELECTED) === null;
}

function addCatalogueItemToBucket(state, { keyName, catalogueItem }) {
    let attribute = catalogueItem.get('identifier'),
        interval = catalogueItem.get('interval'),
        newState = state,
        bucketItem = (keyName === FILTERS ?
            filterBucketItem : bucketItemFactory)({ attribute, interval });

    if (isCategoriesOrStacks(keyName)) {
        newState = addItems(newState, FILTERS, List([filterBucketItem({ attribute, interval, isAutoCreated: true })]));
    }

    if (isDateItem(catalogueItem) && isNoDateSelected(state)) {
        newState = setDateDataSet(newState, {
            value: newState.getIn(Paths.DATE_DATASETS_FIRST_AVAILABLE)
        });
    }

    newState = addItems(newState, keyName, List([bucketItem]));

    return updateSortInfo(newState);
}

function removeBucketItem(state, { bucketItem, from }) {
    const itemPath = getBucketItemPath(state, bucketItem);

    if (!itemPath) {
        return state;
    }

    let partialState = state;

    if (isCategoriesOrStacks(from)) {
        partialState = removeUneditedFilters(state, [bucketItem.get('attribute')]);
    }

    partialState = partialState.deleteIn(itemPath);

    return updateSortInfo(partialState);
}

function replaceBucketItemWithCatalogueItem(state, { bucketItem, catalogueItem }) {
    let { bucket, index } = getBucketItemIndex(state, bucketItem);

    if (!bucket) {
        return state;
    }

    let attribute = catalogueItem.get('identifier'),
        newBucketItem = bucketItemFactory({ attribute }),
        keyName = bucket.get('keyName');

    let partialState = state;

    if (isCategoriesOrStacks(keyName)) {
        partialState = removeUneditedFilters(partialState, [bucketItem.get('attribute')]);
        partialState = addItems(partialState, FILTERS, List([filterBucketItem({ attribute, isAutoCreated: true })]));
    }

    partialState = partialState
        .setIn([...getItemsPath(keyName), index], newBucketItem);

    return updateSortInfo(partialState);
}

function swapBucketItem(state, { keyName, from, to }) {
    if (!keyName) {
        const fromPath = getBucketItemPath(state, from);
        const toPath = getBucketItemPath(state, to);

        let partialState = state;

        if (to.get('attribute') === DATE_DATASET_ATTRIBUTE) {
            partialState = partialState.deleteIn(fromPath);
        } else {
            partialState = partialState.setIn(fromPath, to);
        }

        partialState = partialState.setIn(toPath, from);

        return partialState;
    }

    return addItems(
        removeBucketItem(state, { bucketItem: from }),
        keyName, List([from])
    );
}

let handlers = {
    [Actions.BUCKETS_SELECT_VISUALIZATION_TYPE]: selectVisualizationType,
    [Actions.BUCKETS_SET_BUCKET_ITEM_COLLAPSED]: setBucketItemCollapsed,
    [Actions.BUCKETS_SET_BUCKET_ITEM_AGGREGATION]: setBucketItemProperty.bind(null, 'aggregation'),
    [Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT]: setBucketItemProperty.bind(null, 'showInPercent'),
    [Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_POP]: setBucketItemProperty.bind(null, 'showPoP'),
    [Actions.BUCKETS_SET_BUCKET_ITEM_DATE_DATASET]: setDateDataSet,
    [Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY]: setBucketItemProperty.bind(null, 'granularity'),
    [Actions.BUCKETS_SET_BUCKET_ITEM_ADD_FILTER]: addCatalogueItemToBucket,
    [Actions.BUCKETS_SET_BUCKET_ITEM_REMOVE_FILTER]: removeBucketItem,
    [Actions.BUCKETS_DND_ITEM_INSERT]: addCatalogueItemToBucket,
    [Actions.BUCKETS_DND_ITEM_REMOVE]: removeBucketItem,
    [Actions.BUCKETS_DND_ITEM_REPLACE]: replaceBucketItemWithCatalogueItem,
    [Actions.BUCKETS_DND_ITEM_SWAP]: swapBucketItem
};

export function removeMetricsFlag(state, flag) {
    const metricsPath = getItemsPath(METRICS);
    const items = state.getIn(metricsPath).map(metric => metric.set(flag, false));

    return state.setIn(metricsPath, items);
}

function isNoDateBucketItem(state) {
    const bucketItems = state.getIn(Paths.BUCKETS_CATEGORIES_ITEMS)
        .concat(state.getIn(Paths.BUCKETS_FILTERS_ITEMS));

    return !bucketItems.some(isDateItem);
}

function sanitize(state) {
    const buckets = state.getIn(Paths.BUCKETS);
    const visType = state.getIn(Paths.VISUALIZATION_TYPE);

    let sanitized = state;

    if (!isShowInPercentValid(visType, buckets)) {
        sanitized = removeMetricsFlag(sanitized, 'showInPercent');
    }

    if (!isShowPoPValid(visType, buckets)) {
        sanitized = removeMetricsFlag(sanitized, 'showPoP');
    }

    if (isNoDateBucketItem(sanitized)) {
        sanitized = removeDateDataSet(sanitized);
    }

    return sanitized;
}

export default (state, action) => {
    let handler = handlers[action.type];

    return handler ? sanitize(handler(state, action.payload)) : state;
};

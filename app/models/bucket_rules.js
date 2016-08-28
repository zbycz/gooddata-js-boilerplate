import { Map, List, fromJS } from 'immutable';
import { partial } from 'lodash';

import { DATE_DATASET_ATTRIBUTE } from './date_item';
import { VISUALIZATION_TYPES, VISUALIZATION_TYPE_COLUMN } from './visualization_type';

import * as ItemTypes from '../constants/DragItemTypes';
import { METRICS, CATEGORIES, FILTERS, STACKS } from '../constants/bucket';
import { ALL_TIME } from '../constants/presets';

const ATTRIBUTE = 'attribute';

const DEFAULT_BUCKET_RULES = fromJS({
    metrics: {
        accepts: ['metric', 'fact', 'attribute'],
        itemsLimit: 20,
        allowsDuplicateItems: true,
        enabled: true
    },
    categories: {
        accepts: ['attribute', 'date'],
        itemsLimit: 1,
        allowsSwapping: true,
        enabled: true
    },
    filters: {
        accepts: ['attribute', 'date'],
        itemsLimit: 20,
        enabled: true
    },
    stacks: {
        accepts: ['attribute'],
        itemsLimit: 1,
        allowsSwapping: true,
        enabled: true
    }
});

const VISUALIZATION_BUCKET_RULES = fromJS({
    table: {
        categories: {
            itemsLimit: 20
        },
        stacks: {
            enabled: false
        }
    },
    default: {
        categories: {
            itemsLimit: 1
        }
    }
});

const BUCKET_RULES = VISUALIZATION_TYPES.reduce((memo, type) => {
    let rules = VISUALIZATION_BUCKET_RULES.get(type, VISUALIZATION_BUCKET_RULES.get('default'));
    return memo.set(type, DEFAULT_BUCKET_RULES.mergeDeep(rules));
}, Map());

export function bucketRules(visType, keyName) {
    return BUCKET_RULES.getIn([visType, keyName]);
}

export function bucketRule(visType, keyName, rule) {
    return bucketRules(visType, keyName).get(rule);
}

function getBucketItems(buckets, keyName) {
    return buckets.getIn([keyName, 'items']) || List();
}

function getItemsCount(buckets, keyName) {
    return getBucketItems(buckets, keyName).size;
}

function isEnabled(visType, buckets, { to }) {
    return bucketRule(visType, to, 'enabled');
}

function isAccepted(visType, buckets, { to, item }) {
    return bucketRule(visType, to, 'accepts').contains(item.get('type'));
}

export function isWithinLimit(visType, buckets, { to }) {
    return bucketRule(visType, to, 'itemsLimit') > getItemsCount(buckets, to);
}

function hasIdentifier(identifier, bucketItem) {
    return bucketItem.get('attribute') === identifier;
}

function hasType(type, bucketItem) {
    return !!bucketItem && bucketItem.get('type') === type;
}

function checkDuplicateItem(visType, buckets, { to, item }) {
    return bucketRule(visType, to, 'allowsDuplicateItems') ||
        !getBucketItems(buckets, to)
            .some(hasIdentifier.bind(null, item.get('identifier')));
}

function checkMultipleDate(visType, buckets, { to, item }) {
    return item.get('identifier') !== DATE_DATASET_ATTRIBUTE ||
        !getBucketItems(buckets, to)
            .some(hasIdentifier.bind(null, DATE_DATASET_ATTRIBUTE));
}

function checkReplaceItself(visType, buckets, { to, item, bucketItem }) {
    return bucketRule(visType, to, 'allowsDuplicateItems') ||
        !hasIdentifier(item.get('identifier'), bucketItem);
}

function checkSwapping(visType, buckets, { to, type, from }) {
    return type !== ItemTypes.BUCKET_ITEM ||
        (bucketRule(visType, to, 'allowsSwapping') && bucketRule(visType, from, 'allowsSwapping'));
}

function checkSameBucket(visType, buckets, { to, from }) {
    return from !== to;
}

function canAddMoreMetrics(visType, buckets) {
    return !(getItemsCount(buckets, METRICS) >= 1 && getItemsCount(buckets, STACKS) === 1);
}

function canAddMoreStacks(visType, buckets) {
    return getItemsCount(buckets, METRICS) <= 1;
}

export function isAllowedToAddMetricsStacks(visType, buckets, { to }) {
    switch (to) {
        case METRICS:
            return canAddMoreMetrics(visType, buckets);
        case STACKS:
            return canAddMoreStacks(visType, buckets);
        default:
            return true;
    }
}

let checkAddMoreMetricsStacks = isAllowedToAddMetricsStacks;

function allRulesMet(rules, visType, buckets, data) {
    return rules.every(rule => rule(visType, buckets, data));
}

export function isAllowedToAdd(visType, buckets, data) {
    const rules = [
        isEnabled,
        isAccepted,
        isWithinLimit,
        checkDuplicateItem,
        checkMultipleDate,
        checkSwapping,
        checkSameBucket,
        checkAddMoreMetricsStacks
    ];

    return allRulesMet(rules, visType, buckets, data);
}

export function isAllowedToReplace(visType, buckets, data) {
    const rules = [
        isEnabled,
        isAccepted,
        checkDuplicateItem,
        checkMultipleDate,
        checkSwapping,
        checkSameBucket,
        checkReplaceItself
    ];

    return allRulesMet(rules, visType, buckets, data);
}

function hasOneMetric(visType, buckets) {
    return getItemsCount(buckets, METRICS) === 1;
}

function hasSomeCategories(visType, buckets) {
    return getItemsCount(buckets, CATEGORIES) > 0;
}

function hasSomeDateDataSet(visType, buckets, data) {
    const { dateDataSets } = data;
    return dateDataSets && dateDataSets.get('available').size > 0;
}

function hasNoStacking(visType, buckets) {
    return getItemsCount(buckets, STACKS) === 0;
}

const isDate = partial(hasIdentifier, DATE_DATASET_ATTRIBUTE);

function hasDateInCategories(visType, buckets) {
    return getBucketItems(buckets, CATEGORIES).some(isDate);
}

function hasNoDateInCategories(visType, buckets) {
    return !hasDateInCategories(visType, buckets);
}

function hasDateFilter(visType, buckets) {
    return getBucketItems(buckets, FILTERS)
        .filter(isDate)
        .some(item => {
            const interval = item.getIn(['filters', 0, 'interval']);
            return interval && interval.get('name') !== ALL_TIME;
        });
}

function hasNoAttributesInCategories(visType, buckets, data) {
    const { itemCache } = data;
    const attributes = getBucketItems(buckets, CATEGORIES)
        .map(item => itemCache.get(item.get(ATTRIBUTE)))
        .filter(partial(hasType, ATTRIBUTE));

    return attributes.size === 0;
}

function hasOneAttribute(visType, buckets, data) {
    const { itemCache } = data;
    const attributes = getBucketItems(buckets, CATEGORIES)
        .map(item => itemCache && itemCache.get(item.get(ATTRIBUTE)))
        .filter(partial(hasType, ATTRIBUTE));

    return attributes.size === 1;
}

function hasUsedDate(visType, buckets) {
    return hasDateInCategories(visType, buckets) || hasDateFilter(visType, buckets);
}

function isVisTypeColumn(visType) {
    return visType === VISUALIZATION_TYPE_COLUMN;
}

function percentageNotSelected(visType, buckets) {
    const items = getBucketItems(buckets, METRICS);
    return !items.getIn([0, 'showInPercent']);
}

function popNotSelected(visType, buckets) {
    const items = getBucketItems(buckets, METRICS);
    return !items.getIn([0, 'showPoP']);
}

function hasAvailableAttributes(visType, buckets, { availableAttributes }) {
    return availableAttributes.size > 0;
}

export function isShowInPercentValid(visType, buckets) {
    const rules = [
        hasOneMetric,
        hasNoStacking,
        hasSomeCategories
    ];

    return allRulesMet(rules, visType, buckets);
}

export function displayRecommendationComparisonWithPeriod(visType, buckets, dateDataSets, itemCache) {
    const rules = [
        hasOneMetric,
        hasOneAttribute,
        hasNoStacking,
        hasSomeCategories,
        hasNoDateInCategories,
        isVisTypeColumn,
        percentageNotSelected,
        popNotSelected,
        hasSomeDateDataSet
    ];

    return allRulesMet(rules, visType, buckets, { dateDataSets, itemCache });
}

export function displayRecommendationContributionInPercents(visType, buckets, itemCache) {
    const rules = [
        hasOneMetric,
        hasOneAttribute,
        hasNoStacking,
        hasSomeCategories,
        hasNoDateInCategories,
        isVisTypeColumn,
        percentageNotSelected
    ];

    return allRulesMet(rules, visType, buckets, { itemCache });
}

export function displayRecommendationMetricWithPeriod(visType, buckets, dateDataSets, itemCache) {
    const rules = [
        hasOneMetric,
        popNotSelected,
        hasDateInCategories,
        hasDateFilter,
        hasNoStacking,
        hasNoAttributesInCategories,
        isVisTypeColumn
    ];

    return allRulesMet(rules, visType, buckets, { dateDataSets, itemCache });
}

export function displayRecommendationsTrending(visType, buckets, dateDataSets, itemCache) {
    const rules = [
        hasOneMetric,
        hasNoDateInCategories,
        hasNoAttributesInCategories,
        isVisTypeColumn,
        hasSomeDateDataSet
    ];

    return allRulesMet(rules, visType, buckets, { dateDataSets, itemCache });
}

export function displayRecommendationComparison(visType, buckets, itemCache, availableAttributes) {
    const rules = [
        hasOneMetric,
        hasNoDateInCategories,
        hasNoAttributesInCategories,
        isVisTypeColumn,
        hasAvailableAttributes
    ];

    return allRulesMet(rules, visType, buckets, { itemCache, availableAttributes });
}

export function isShowPoPValid(visType, buckets) {
    const rules = [
        hasOneMetric,
        hasNoStacking,
        hasUsedDate
    ];

    return allRulesMet(rules, visType, buckets);
}

export function isAllowedToChangeDateFilterDimension(visType, buckets) {
    return [METRICS, CATEGORIES, STACKS].every(keyName =>
        !bucketRule(visType, keyName, 'accepts').contains('date') ||
        !getBucketItems(buckets, keyName).some(hasIdentifier.bind(this, DATE_DATASET_ATTRIBUTE))
    );
}

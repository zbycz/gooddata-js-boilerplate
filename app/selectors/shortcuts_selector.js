import { createSelector } from 'reselect';
import * as StatePaths from '../constants/StatePaths';
import { METRICS, CATEGORIES, STACKS } from '../constants/bucket';
import { METRIC, ATTRIBUTE, FACT, DATE } from '../constants/CatalogueItemTypes';

import shortcutMetricOverTimeSelector from './shortcut_metric_over_time_selector';

export const activeDragItemSelector = state => state.getIn(StatePaths.ACTIVE_DRAG_ITEM);

const hasItems = (state, type) => {
    const items = state.getIn([...StatePaths.BUCKETS, type, 'items']);
    return !!items && items.size > 0;
};

const isMetricOverTimeDisabledSelector = state => {
    const { availableDateDataSets, areDateDataSetsLoaded } = shortcutMetricOverTimeSelector(state);

    return !availableDateDataSets.count() && areDateDataSetsLoaded;
};

export const isReportEmptySelector = state => {
    const hasCategories = hasItems(state, CATEGORIES);
    const hasMetrics = hasItems(state, METRICS);
    const hasStacks = hasItems(state, STACKS);

    return !hasCategories && !hasMetrics && !hasStacks;
};

const isOfType = (activeDragItem, type) =>
    !!activeDragItem && activeDragItem.get('type') === type;

const isAttributeSelector = createSelector(
    activeDragItemSelector,

    activeDragItem => isOfType(activeDragItem, ATTRIBUTE)
);

const isDateSelector = createSelector(
    activeDragItemSelector,

    activeDragItem => isOfType(activeDragItem, DATE)
);

export const getDroppedCatalogueItem =
    state => state.getIn(StatePaths.SHORTCUT_DROPPED_ITEM);

const isMetricSelector = createSelector(
    activeDragItemSelector,
    getDroppedCatalogueItem,

    (activeDragItem, droppedCatalogueItem) =>
        isOfType(activeDragItem, METRIC) || isOfType(activeDragItem, FACT) || !!droppedCatalogueItem
);

export const displayAttributeSelector = createSelector(
    isReportEmptySelector,
    isAttributeSelector,
    isDateSelector,

    (isEmpty, isAttribute, isDate) => isEmpty && (isAttribute || isDate)
);

export const displayMetricSelector = createSelector(
    isReportEmptySelector,
    isMetricSelector,

    (isEmpty, isMetric) => isEmpty && isMetric
);

export const displayMetricOverTimeSelector = createSelector(
    isReportEmptySelector,
    isMetricSelector,
    state => state.getIn(StatePaths.DATE_DATASETS_AVAILABLE),

    (isEmpty, isMetric, availableDateDataSets) =>
        isEmpty && isMetric && availableDateDataSets.size > 0
);

export const displayBlockSelector = createSelector(
    displayAttributeSelector,
    displayMetricSelector,
    getDroppedCatalogueItem,

    (displayAttribute, displayMetric, droppedCatalogueItem) =>
        (displayAttribute || displayMetric) && !droppedCatalogueItem
);


export default createSelector(
    activeDragItemSelector,
    displayBlockSelector,
    displayAttributeSelector,
    displayMetricSelector,
    displayMetricOverTimeSelector,
    isMetricOverTimeDisabledSelector,

    (activeDragItem, displayBlock, displayAttribute, displayMetric, displayMetricOverTime, isMetricOverTimeDisabled) => ({
        activeDragItem,
        displayBlock,
        displayAttribute,
        displayMetric,
        displayMetricOverTime,
        isMetricOverTimeDisabled
    })
);

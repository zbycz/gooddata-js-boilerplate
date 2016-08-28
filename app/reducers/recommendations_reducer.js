import * as Actions from '../constants/Actions';
import * as Paths from '../constants/StatePaths';
import { GRANULARITY } from '../models/granularity';
import { getGranularityPresets } from '../models/preset_item';
import * as PresetNames from '../constants/presets';
import { CATEGORIES, FILTERS } from '../constants/bucket';
import { VISUALIZATION_TYPE_BAR } from '../models/visualization_type';

import * as bucketsHelpers from '../utils/buckets_reducer_helpers';

const getFirstMetric = state => state.getIn([...Paths.BUCKETS_METRICS_ITEMS, 0]);

const getComparisonWithPeriodInterval = granularity => {
    let name;

    switch (granularity) {
        case GRANULARITY.month:
            name = PresetNames.THIS_MONTH;
            break;
        case GRANULARITY.quarter:
            name = PresetNames.THIS_QUARTER;
            break;
        default:
            throw new Error(`Bad granularity: ${granularity}`);
    }
    return getGranularityPresets(name);
};

const applyComparisonWithPeriod = (state, granularity) => {
    let newState = state;

    const metric = getFirstMetric(newState);
    const interval = getComparisonWithPeriodInterval(granularity);

    newState = bucketsHelpers.updateItemFilter(newState, FILTERS, { interval });
    newState = bucketsHelpers.setShowPoP(newState, metric, true);

    return newState;
};

const applyContributionInPercents = state => {
    let newState = state;

    const metric = getFirstMetric(newState);

    newState = bucketsHelpers.setShowInPercent(newState, metric, true);
    newState = bucketsHelpers.setVisualizationType(newState, VISUALIZATION_TYPE_BAR);

    return newState;
};

const applyMetricWithPeriod = state => {
    const item = getFirstMetric(state);

    return bucketsHelpers.setShowPoP(state, item, true);
};

const applyTrending = (state, granularity) => {
    let newState = state;

    newState = bucketsHelpers.ensureDate(newState, CATEGORIES);
    newState = bucketsHelpers.setGranularity(newState, CATEGORIES, granularity);

    const interval = getGranularityPresets(PresetNames.LAST_4_QUARTERS);
    newState = bucketsHelpers.updateItemFilter(newState, FILTERS, { interval });

    if (!newState.getIn(Paths.DATE_DATASETS_SELECTED)) {
        newState = newState.setIn(Paths.DATE_DATASETS_SELECTED,
            newState.getIn(Paths.DATE_DATASETS_FIRST_AVAILABLE));
    }

    return newState;
};

const applyComparison = (state, attribute) => {
    let newState = state;

    const catalogueItem = state.getIn(Paths.AVAILABLE_ATTRIBUTES_ITEMS)
        .find(item => item.get('identifier') === attribute);

    newState = state.setIn([...Paths.ITEM_CACHE, attribute], catalogueItem);

    return bucketsHelpers.addItem(newState, CATEGORIES, catalogueItem);
};

const handlers = {
    [Actions.RECOMMENDATION_COMPARISON_WITH_PERIOD]: applyComparisonWithPeriod,
    [Actions.RECOMMENDATION_CONTRIBUTION_IN_PERCENT]: applyContributionInPercents,
    [Actions.RECOMMENDATION_METRIC_WITH_PERIOD]: applyMetricWithPeriod,
    [Actions.RECOMMENDATION_TRENDING]: applyTrending,
    [Actions.RECOMMENDATION_COMPARISON]: applyComparison
};

export default (state, action) => {
    const handler = handlers[action.type];

    return handler ? handler(state, action.payload) : state;
};

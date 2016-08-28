import { fromJS } from 'immutable';
import * as Actions from '../constants/Actions';
import { GRANULARITY } from '../models/granularity';
import { PRESETS_PURE } from '../models/preset_item';
import * as PresetNames from '../constants/presets';
import { CATEGORIES, METRICS, FILTERS } from '../constants/bucket';
import { VISUALIZATION_TYPE_TABLE, VISUALIZATION_TYPE_COLUMN } from '../models/visualization_type';

import * as StatePaths from '../constants/StatePaths';
import * as bucketsHelpers from '../utils/buckets_reducer_helpers';

const setDateDataSetsLoadedFlag = (state, val) => {
    return state.setIn(StatePaths.SHORTCUT_DATE_DATASETS_LOADED, val);
};

export const setDroppedItem = (state, catalogueItem) => {
    return state.setIn(StatePaths.SHORTCUT_DROPPED_ITEM, catalogueItem);
};

const setDateDataSets = (state, dateDataSets) => {
    return setDateDataSetsLoadedFlag(state, true)
        .mergeIn(StatePaths.SHORTCUT_DATE_DATASETS, fromJS(dateDataSets));
};

const applyAttribute = (state, item) => {
    let newState;

    newState = bucketsHelpers.addItem(state, CATEGORIES, item);
    newState = bucketsHelpers.setVisualizationType(newState, VISUALIZATION_TYPE_TABLE);
    newState = setDroppedItem(newState, null);

    return newState;
};

const applyMetric = (state, item) => {
    let newState;

    newState = bucketsHelpers.addItem(state, METRICS, item);
    newState = bucketsHelpers.setVisualizationType(newState, VISUALIZATION_TYPE_COLUMN);
    newState = setDroppedItem(newState, null);

    return newState;
};

function updateDateDataSets(newState) {
    return newState
        .setIn(StatePaths.DATE_DATASETS_AVAILABLE, newState.getIn(StatePaths.SHORTCUT_DATE_DATASETS_AVAILABLE))
        .setIn(StatePaths.DATE_DATASETS_UNAVAILABLE, newState.getIn(StatePaths.SHORTCUT_DATE_DATASETS_UNAVAILABLE))
        .setIn(StatePaths.DATE_DATASETS_SELECTED, newState.getIn(StatePaths.SHORTCUT_DATE_DATASETS_FIRST_AVAILABLE));
}

const applyMetricOverTime = (state, item) => {
    let newState = bucketsHelpers.addItem(state, METRICS, item);

    if (state.getIn(StatePaths.SHORTCUT_DATE_DATASETS_AVAILABLE).size) {
        newState = updateDateDataSets(newState);
        newState = bucketsHelpers.ensureDate(newState, CATEGORIES);
        newState = bucketsHelpers.setGranularity(newState, CATEGORIES, GRANULARITY.quarter);
        newState = bucketsHelpers.updateItemFilter(newState, FILTERS, { interval: PRESETS_PURE.get(PresetNames.LAST_4_QUARTERS) });
    }

    newState = bucketsHelpers.setVisualizationType(newState, VISUALIZATION_TYPE_COLUMN);
    newState = setDroppedItem(newState, null);
    return newState;
};

export default (state, action) => {
    switch (action.type) {
        case Actions.SHORTCUT_APPLY_ATTRIBUTE:
            return applyAttribute(state, action.payload);

        case Actions.SHORTCUT_APPLY_METRIC:
            return applyMetric(state, action.payload);

        case Actions.SHORTCUT_APPLY_METRIC_OVER_TIME:
            return applyMetricOverTime(state, action.payload);

        case Actions.SHORTCUT_DATE_DATASETS_UPDATE:
            return setDateDataSetsLoadedFlag(state, false);

        case Actions.SHORTCUT_DATE_DATASETS_UPDATED:
            return setDateDataSets(state, action.payload);

        case Actions.SHORTCUT_SET_DROPPED_ITEM:
            return setDroppedItem(state, action.payload.catalogueItem);

        default:
            return state;
    }
};

import { fromJS, List } from 'immutable';
import { indexBy } from '../utils/immutable';

import * as Actions from '../constants/Actions';
import * as StatePaths from '../constants/StatePaths';
import { FILTER_ALL_DATA } from '../constants/Datasets';

function getItems(state, items) {
    return fromJS(items).map(item => item.set('dataset', state.getIn(StatePaths.CATALOGUE_ACTIVE_DATASET_ID)));
}

function updateCatalogue(state, payload) {
    const items = getItems(state, payload.items);
    return state
        .mergeDeepIn(StatePaths.ITEM_CACHE, indexBy(items, 'id'))
        .setIn(StatePaths.CATALOGUE_LOADING, false)
        .setIn(StatePaths.CATALOGUE_ITEMS, items.map(item => item.get('id')))
        .setIn(StatePaths.CATALOGUE_TOTALS, fromJS(payload.totals));
}

function updateItemDetail(state, { itemId, detail }) {
    return state.mergeIn(
        [...StatePaths.ITEM_CACHE, itemId],
        fromJS({ details: detail })
    );
}

function setActiveFilterIndex(state, { index }) {
    return state.setIn(StatePaths.CATALOGUE_ACTIVE_FILTER_INDEX, index)
                .setIn(StatePaths.CATALOGUE_QUERY, '');
}

function setActiveDatasetId(state, { datasetId }) {
    return state.setIn(StatePaths.CATALOGUE_ACTIVE_DATASET_ID, datasetId)
                .setIn(StatePaths.CATALOGUE_QUERY, '')
                .setIn(StatePaths.CATALOGUE_ACTIVE_FILTER_INDEX, FILTER_ALL_DATA);
}

function updateDateDataSets(state, dateDataSets) {
    return state
        .mergeIn(StatePaths.DATE_DATASETS, fromJS(dateDataSets))
        .setIn(StatePaths.DATE_DATASETS_LOADED, true);
}

function availableAttributesUpdate(state, { metric }) {
    return state
        .setIn(StatePaths.AVAILABLE_ATTRIBUTES_ITEMS, List())
        .setIn(StatePaths.AVAILABLE_ATTRIBUTES_METRIC, metric);
}

function availableAttributesUpdated(state, { metric, items }) {
    const newItems = fromJS(items);
    if (state.getIn(StatePaths.AVAILABLE_ATTRIBUTES_METRIC) === metric) {
        return state.setIn(StatePaths.AVAILABLE_ATTRIBUTES_ITEMS, newItems);
    }

    return state;
}


export default (state, action) => {
    switch (action.type) {
        case Actions.CATALOGUE_UPDATE_STARTED:
            return state.setIn(StatePaths.CATALOGUE_LOADING, true);

        case Actions.CATALOGUE_SET_ACTIVE_FILTER_INDEX:
            return setActiveFilterIndex(state, action.payload);

        case Actions.CATALOGUE_SET_QUERY:
            return state.setIn(StatePaths.CATALOGUE_QUERY, action.payload.query);

        case Actions.CATALOGUE_SET_ACTIVE_DATASET_ID:
            return setActiveDatasetId(state, action.payload);

        case Actions.CATALOGUE_UPDATE_FINISHED:
            return updateCatalogue(state, action.payload);

        case Actions.ITEM_DETAIL_DATA:
            return updateItemDetail(state, action.payload);

        case Actions.DATASETS_DATA:
            return state.setIn(StatePaths.DATASETS, fromJS(action.payload.datasets));

        case Actions.DATE_DATASETS_DATA:
            return updateDateDataSets(state, action.payload);

        case Actions.AVAILABLE_ATTRIBUTES_UPDATE:
            return availableAttributesUpdate(state, action.payload);

        case Actions.AVAILABLE_ATTRIBUTES_UPDATED:
            return availableAttributesUpdated(state, action.payload);

        default:
            return state;
    }
};

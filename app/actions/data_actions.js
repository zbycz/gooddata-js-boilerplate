import * as Actions from '../constants/Actions';

import { loadDetails } from '../services/catalogue_details_loader';
import { getUserUri, getProjectId } from '../selectors/bootstrap_selector';

import { groupDatasets } from '../services/dataset_service';

import * as API from '../utils/api';
import { setDatasetId } from '../utils/location';
import { identity } from 'lodash';

import { logger } from './log_decorator';
import { log } from '../services/logger_service';
import { catalogFormatter } from './log_formatters';

export function catalogueItemDetailRequested(item, loadItemDetails = loadDetails) {
    return (dispatch, getState) => {
        const projectId = getProjectId(getState());

        dispatch({ type: Actions.ITEM_DETAIL_REQUEST });

        return loadItemDetails(item, projectId).then(data => dispatch({
            type: Actions.ITEM_DETAIL_DATA,
            payload: {
                detail: data,
                itemId: item.identifier
            }
        }));
    };
}

const logDependencies = {
    log,
    formatter: catalogFormatter
};

function startCatalogueUpdatePure() {
    return {
        type: Actions.CATALOGUE_UPDATE_STARTED
    };
}

export const startCatalogueUpdate = (dependencies = logDependencies) =>
    logger(dependencies, startCatalogueUpdatePure)();

export function dateDataSetsUpdated(dateDataSets) {
    return {
        type: Actions.DATE_DATASETS_DATA,
        payload: dateDataSets
    };
}

function catalogueUpdatedPure(payload) {
    return {
        type: Actions.CATALOGUE_UPDATE_FINISHED,
        payload: {
            initialLoad: payload.initialLoad,
            items: payload.data.items.filter(identity),
            // identity -> filter out undefined items from page requests
            totals: {
                available: payload.data.totalCount,
                unavailable: -1
            }
        }
    };
}

export const catalogueUpdated = (payload, dependencies = logDependencies) =>
    logger(dependencies, catalogueUpdatedPure)(payload);

export function setCatalogueQuery(query) {
    return {
        type: Actions.CATALOGUE_SET_QUERY,
        payload: { query }
    };
}

export function setCatalogueFilter(index) {
    return { type: Actions.CATALOGUE_SET_ACTIVE_FILTER_INDEX, payload: { index } };
}

const setActiveCatalogueDatasetPure = payload =>
    ({ type: Actions.CATALOGUE_SET_ACTIVE_DATASET_ID, payload });

export const setActiveCatalogueDataset = (payload, dependencies = logDependencies) =>
    logger(dependencies, setActiveCatalogueDatasetPure)(payload);

export function datasetSelectRequested(windowInstance, datasetId) {
    let oldHash = windowInstance.location.hash;
    let updatedHash = setDatasetId(datasetId, oldHash);
    let uri = windowInstance.location.pathname + updatedHash;
    windowInstance.history.pushState(null, null, uri);

    return setActiveCatalogueDataset({ datasetId, preselect: false });
}

export function datasetsRequested(projectId, loadDatasets = API.loadDatasets) {
    return (dispatch, getState) => {
        let userUri = getUserUri(getState());

        return loadDatasets(projectId)
            .then(datasets => {
                dispatch({
                    type: Actions.DATASETS_DATA,
                    payload: { datasets: groupDatasets(datasets, userUri) }
                });
            });
    };
}

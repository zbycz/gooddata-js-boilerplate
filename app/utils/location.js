import URI from 'urijs';
import { get, partial } from 'lodash';

export function getCurrentHash() {
    return window.location.hash;
}

export function getProjectIdFromUri(hash = '') {
    let matches = hash.match(/#\/(\w+)\//);

    return matches ? matches[1] : null;
}

export function getHashParam(key, hash) {
    let queryParams = URI(hash.slice(1)).query(true);
    return get(queryParams, key, null);
}

export const getDatasetIdFromUri = partial(getHashParam, 'dataset');

export function getRouteParams(hash = '') {
    return {
        datasetId: getDatasetIdFromUri(hash),
        projectId: getProjectIdFromUri(hash)
    };
}

export function setHashParam(key, value, hash) {
    let uriInstance = URI(hash.slice(1));
    let queryParams = uriInstance.query(true);

    if (value === null) {
        delete queryParams[key];
    } else {
        queryParams[key] = value;
    }

    return `#${uriInstance.query(queryParams).toString()}`;
}

export const setDatasetId = partial(setHashParam, 'dataset');

export function getProjectUri(windowInstance, projectId) {
    return `${windowInstance.location.pathname}#/${projectId}/reportId/edit`;
}

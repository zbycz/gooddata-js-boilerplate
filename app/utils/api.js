import Promise from 'bluebird';
import sdk from 'gooddata';
import { string } from 'js-utils';
import { sortBy, uniqBy, partial, pick, cloneDeep, get } from 'lodash';
import deserializeItems from '../services/catalogue_item_deserializer';
import { NOT_AUTHENTICATED_ERROR } from '../constants/Errors';
import { wrapPromise } from '../utils/promises';
import { typedObject } from '../utils/object';

import { post, put } from '../utils/xhr';

// Setup SDK's session id before first usage
const sessionId = `adi_${string.randomString(10)}_`;

sdk.xhr.ajaxSetup({
    beforeSend(xhrClient) {
        xhrClient.setRequestHeader('X-GDC-REQUEST', sessionId + string.randomString(10));
    }
});

function parseCatalogueItems(catalogueResponse) {
    const { catalog } = catalogueResponse;
    return {
        ...catalogueResponse,
        catalog: deserializeItems(catalog)
    };
}

export function getCsvUploaderUrl(projectId) {
    return `/data/#/projects/${projectId}/upload`;
}

export function bootstrap(projectId) {
    let uri = '/gdc/app/account/bootstrap';

    if (projectId) {
        uri = `${uri}?projectUri=/gdc/projects/${projectId}`;
    }

    return wrapPromise(sdk.xhr.get(uri))
        .catch(() => Promise.reject({ type: NOT_AUTHENTICATED_ERROR }));
}

export function loadDateDataSets(projectId, options) {
    const $promise = sdk.catalogue.loadDateDataSets(projectId, options);

    const wrap = dateDataSets => dateDataSets.map(partial(typedObject, 'dateDataSet'));

    return wrapPromise($promise).then(res => {
        let { dateDataSets, unavailableDateDataSetsCount } = res.dateDataSetsResponse;

        return {
            available: deserializeItems(wrap(dateDataSets)),
            unavailable: unavailableDateDataSetsCount
        };
    });
}

export function loadCatalogueItems(projectId, options) {
    const $promise = sdk.catalogue.loadItems(projectId, options);

    return wrapPromise($promise).then(parseCatalogueItems);
}

export function loadMetricAttributes(projectId, mdObject, options) {
    const $promise = sdk.catalogue.loadItems(projectId, {
        ...options,
        types: ['attribute'],
        bucketItems: mdObject,
        returnAllDateDataSets: true
    });

    return wrapPromise($promise).then(parseCatalogueItems);
}

function pickUriAndTitle(item) {
    return pick(item, 'uri', 'title');
}

function unwrapElement(item) {
    return item.element;
}

function xhrValidElements(uri, uris = []) {
    return sdk.xhr.ajax(uri, {
        type: 'POST',
        data: {
            validElementsRequest: {
                uris
            }
        }
    });
}


export function loadAttributeElementsSelection(dfUri, itemUris, validElementsRequest = xhrValidElements) {
    const uriWithLimit = `${dfUri}/validElements?limit=545`;
    const selectionUri = `${dfUri}/validElements`;

    // plain valid elements are needed for "totalElementsCount" which is used mainly in
    // negative filter selection count ("see metadata.js -> processAttributeFilter")
    return Promise.props({
        valid: validElementsRequest(uriWithLimit),
        selected: validElementsRequest(selectionUri, itemUris)
    }).then(result => {
        const total = get(result, 'valid.validElements.paging.total');

        const items = [
            ...get(result, 'valid.validElements.items', []),
            ...get(result, 'selected.validElements.items', [])
        ];

        const unique = uniqBy(items.map(unwrapElement), 'uri');

        return {
            items: unique.map(pickUriAndTitle),
            total: parseInt(total, 10)
        };
    });
}

export function loadAttributeElements(dfUri, filter, offset, limit) {
    let encodedFilter = encodeURIComponent(filter),
        dfId = dfUri.match(/obj\/(.*)/)[1],
        uri = `${dfUri}/validElements?limit=${limit}&id=${dfId}&offset=${offset}&filter=${encodedFilter}`,
        $promise = sdk.xhr.ajax(uri, {
            type: 'POST',
            data: {
                validElementsRequest: {
                    uris: []
                }
            }
        });

    return wrapPromise($promise.then(res => {
        const { items, paging: { total } } = res.validElements;

        return {
            items: items.map(unwrapElement).map(pickUriAndTitle),
            total: parseInt(total, 10)
        };
    }));
}

const isDatasetLoaded = item => item.dataset.datasetLoadStatus === 'OK';

export function loadDatasets(projectId) {
    function createDataset(data) {
        let dataset = data.dataset;

        return {
            name: dataset.name,
            identifier: dataset.datasetId,
            author: dataset.firstSuccessfulUpdate.owner.profileUri
        };
    }

    let uri = `/gdc/dataload/internal/projects/${projectId}/csv/datasets`;
    let $promise = sdk.xhr.get(uri);

    return $promise.then(result => {
        let datasets = result.datasets.items
            .filter(isDatasetLoaded)
            .map(createDataset);
        return sortBy(datasets, dataset => dataset.name.toLowerCase());
    });
}

export function logout() {
    return wrapPromise(sdk.user.logout());
}

export function getCreateUri(projectId) {
    return `/gdc/md/${projectId}/obj?createAndGet=true`;
}

export function getReportUri(reportMDObject) {
    return reportMDObject.visualization.meta.uri;
}

export function stripUpdated(mdObject) {
    const copy = cloneDeep(mdObject);
    delete copy.visualization.meta.updated;

    return copy;
}

export function saveReport({ projectId, reportMDObject, isUpdate, createFunction = post, updateFunction = put }) {
    const stripped = stripUpdated(reportMDObject);
    return isUpdate ?
        updateFunction(getReportUri(stripped), stripped).then(() => reportMDObject) :
        createFunction(getCreateUri(projectId), stripped);
}

export function exportReportToServer(projectId, visualization) {
    return post(`/gdc/internal/projects/${projectId}/convertVisualization`, visualization);
}

export function getObject(uri) {
    return wrapPromise(sdk.xhr.get(uri));
}

export function deleteObject(uri) {
    return wrapPromise(sdk.xhr.ajax(uri, {
        type: 'DELETE'
    }));
}

export function getObjects(uris) {
    return Promise.all(uris.map(getObject));
}

export function updateProfileSettings(projectId, profileSetting) {
    const userId = get(profileSetting, 'links.profile').split('/').pop();
    const newProfileSetting = {
        ...profileSetting,
        currentProjectUri: `/gdc/projects/${projectId}`
    };
    return wrapPromise(sdk.user.updateProfileSettings(userId, { profileSetting: newProfileSetting }));
}

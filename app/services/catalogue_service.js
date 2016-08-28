import Promise from 'bluebird';
import { get, pickBy, includes } from 'lodash';

import * as DataActions from '../actions/data_actions';
import * as CatalogueFilters from '../constants/catalogue_filters';
import * as Api from '../utils/api';
import { createDateItem } from '../models/date_item';

export const projectDataLabel = {
    identifier: 'project_data_item',
    isGroupHeader: true,
    type: 'header'
};

const DATE_ITEM_OFFSET = 1;
export const PROJECT_HEADER_OFFSET = 1;

function normalizeQuery(query = {}) {
    const whitelist = ['filter', 'dataSetIdentifier', 'types', 'bucketItems', 'paging'];
    return pickBy(query, (val, key) => includes(whitelist, key) && val);
}

export function loadCatalogueItems(projectId, query) {
    const normalizedQuery = normalizeQuery(query);
    const request = Api.loadCatalogueItems(projectId, normalizedQuery);

    return request.then(response => {
        const data = {
            offset: query.paging.offset,
            limit: query.paging.limit,
            items: response.catalog,
            totalCount: get(response, 'totals.available'),
            unavailableItemsCount: get(response, 'totals.unavailable')
        };

        return { data };
    });
}

function hadDateDataSets(dateDataSets) {
    return dateDataSets.available.length > 0;
}

function loadDateDataSets(projectId, query) {
    const normalizedQuery = normalizeQuery(query);

    return Api.loadDateDataSets(projectId, normalizedQuery);
}

export function loadDateDataSetsAndCatalog(dispatch, projectId, query) {
    return Promise
        .props({
            dateDataSets: loadDateDataSets(projectId, query),
            catalog: loadCatalogueItems(projectId, query)
        })
        .then(response => {
            const { dateDataSets, catalog } = response;

            dispatch(DataActions.dateDataSetsUpdated(dateDataSets));

            dispatch(DataActions.catalogueUpdated({ ...catalog, initialLoad: true }));

            return response;
        })
        .then(({ catalog, dateDataSets }) => {
            let shouldDisplayDate = hadDateDataSets(dateDataSets);

            if (query.filter && query.filter.length) {
                shouldDisplayDate = false;
            }

            if (query.activeFilter.name === CatalogueFilters.METRICS) {
                shouldDisplayDate = false;
            }

            const offset = (shouldDisplayDate ? DATE_ITEM_OFFSET : 0) + PROJECT_HEADER_OFFSET;

            let items = [];
            if (shouldDisplayDate) {
                items.push(createDateItem().toJS());
            }
            items = [
                ...items, projectDataLabel, ...catalog.data.items
            ];

            const data = {
                items,
                totalCount: catalog.data.totalCount + offset,
                unavailableItemsCount: catalog.data.unavailableItemsCount
            };

            const meta = {
                offset
            };

            return { data, meta };
        });
}

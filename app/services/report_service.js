import * as StatePaths from '../constants/StatePaths';

import { currentReportMDObject } from '../selectors/buckets_selector';
import Promise from 'bluebird';
import {
    get,
    has,
    flatten,
    uniq,
    values,
    keyBy,
    includes
} from 'lodash';
import deserializeItems from './catalogue_item_deserializer';
import { t } from '../utils/translations';
import { getProjectId } from '../selectors/bootstrap_selector';

export function getReportTitle(state) {
    return state.getIn(StatePaths.REPORT_CURRENT_TITLE);
}

export function isReportTitleEmpty(state) {
    return getReportTitle(state) === '';
}

export function getNewReportMDObject(state) {
    const createdReportMDObjectContent = currentReportMDObject(state);
    const lastReportObject = state.getIn(StatePaths.REPORT_LAST_SAVED_OBJECT);

    return lastReportObject
        .setIn(['visualization', 'content'], createdReportMDObjectContent)
        .setIn(['visualization', 'meta', 'title'], getReportTitle(state));
}

export function getVisualizationForExport(state) {
    const title = getReportTitle(state) || t('export.defaultRdTitle');
    return getNewReportMDObject(state)
        .setIn(['visualization', 'meta', 'title'], title);
}

function getMeasureUri(measure) {
    return measure.measure.objectUri;
}

function getMeasureFilterUris(measure) {
    return get(measure, 'measure.measureFilters', [])
        .map(measureFilter => measureFilter.listAttributeFilter.attribute);
}

const isAttributeFilter = filter => has(filter, 'listAttributeFilter');

export const getItemCacheUris = buckets => {
    const measuresUris = buckets.measures.reduce((uris, measure) =>
        ([...uris, getMeasureUri(measure), ...getMeasureFilterUris(measure)]), []);
    const categoriesUris = buckets.categories.map(category => category.category.attribute);
    const filterUris = buckets.filters.filter(isAttributeFilter)
        .map(filter => filter.listAttributeFilter.attribute);

    return uniq([...measuresUris, ...categoriesUris, ...filterUris]);
};

const joinFilterConfigurations = configs => configs.reduce((acc, { dfUri, elementUris = [] }) => {
    acc[dfUri] = acc[dfUri] || { dfUri, elementUris };
    acc[dfUri].elementUris = uniq(acc[dfUri].elementUris.concat(elementUris));

    return acc;
}, {});

const getFilterConfiguration = filter => ({
    dfUri: filter.listAttributeFilter.displayForm,
    elementUris: filter.listAttributeFilter.default.attributeElements
});

export const getFilterItemsDefinitions = buckets => {
    const measureFilters = flatten(buckets.measures
        .filter(measure => has(measure.measure, 'measureFilters'))
        .map(measure => measure.measure.measureFilters)
    );

    const configurations = [...measureFilters, ...buckets.filters]
        .filter(isAttributeFilter)
        .map(getFilterConfiguration);

    return values(joinFilterConfigurations(configurations));
};

const indexByIdentifier = items => keyBy(items, 'identifier');
const indexItemCache = additionalData => ({
    ...additionalData,
    itemCache: indexByIdentifier(additionalData.itemCache)
});

const indexValidElements = validElements => validElements.reduce((filterItems, result) => {
    filterItems[result.filterItemsUri] = {
        items: result.items,
        total: result.total
    };

    return filterItems;
}, {});

const getAttributeElements = (filterItemsDefinition, loadAttributeElementsSelection) => {
    const { dfUri, elementUris } = filterItemsDefinition;
    return loadAttributeElementsSelection(dfUri, elementUris).then(result => ({
        ...result,
        filterItemsUri: dfUri
    }));
};

export const loadAdditionalData = (report, getState, getObjects, loadAttributeElementsSelection, loadDateDataSets) => {
    const buckets = report.content.buckets;

    // skip those which are in cache
    const cachedItemsUris = getState()
        .getIn(StatePaths.ITEM_CACHE)
        .map(value => value.get('uri'))
        .toArray();

    const urisToCache = getItemCacheUris(buckets).filter(uri =>
        !includes(cachedItemsUris, uri));

    const filterItemsPromises = getFilterItemsDefinitions(buckets).map(item => getAttributeElements(item, loadAttributeElementsSelection));

    const projectId = getProjectId(getState());

    return Promise.props({
        itemCache: getObjects(urisToCache).then(deserializeItems),
        filterItems: Promise.all(filterItemsPromises).then(indexValidElements),
        dateDataSets: loadDateDataSets(projectId, {
            bucketItems: report.content,
            returnAllDateDataSets: true
        })
    }).then(indexItemCache);
};

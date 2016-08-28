import * as Actions from '../constants/Actions';
import * as StatePaths from '../constants/StatePaths';
import { fromJS } from 'immutable';
import { metadataToBuckets } from '../models/metadata';

const initiateOpen = state => state.setIn(StatePaths.REPORT_OPENING, true);


const findDataSetAttributeByUri = (dataSetAttributes, uri) => {
    return dataSetAttributes.find(dataSetAttribute => dataSetAttribute.uri === uri);
};

export const getSelectedDateDataSet = (buckets, dateDataSets) => {
    const dateCategory = buckets.categories
        .find(categoryItem => categoryItem.category.type === 'date');

    if (dateCategory) {
        const categoryAttribute = dateCategory.category.attribute;
        return dateDataSets.find(dataSet => findDataSetAttributeByUri(dataSet.attributes, categoryAttribute));
    }

    const dateFilter = buckets.filters.find(filter => filter.dateFilter);

    if (dateFilter) {
        const dateFilterDataSetUri = dateFilter.dateFilter.dataset;
        return dateDataSets.find(dataSet => dataSet.uri === dateFilterDataSetUri);
    }

    return null;
};

const openReport = (state, action) => {
    const { report, report: { content }, loadedItems: { itemCache, dateDataSets, filterItems } } = action.payload;

    const previousItemCache = state.getIn(StatePaths.ITEM_CACHE);
    const updatedItemCache = previousItemCache.merge(itemCache);

    const updatedMD = metadataToBuckets({
        metadataObject: content.buckets,
        additionalData: { itemCache: updatedItemCache.toJS(), filterItems, dateDataSets }
    });

    const selectedDateDataSet = getSelectedDateDataSet(content.buckets, dateDataSets.available);
    let updatedState = state;

    if (selectedDateDataSet) {
        updatedState = updatedState
            .setIn(StatePaths.DATE_DATASETS_SELECTED, fromJS(selectedDateDataSet))
            .updateIn(
                StatePaths.DATE_DATASETS_AVAILABLE,
                available => (
                    available.find(dateDataSet => dateDataSet.get('id') === selectedDateDataSet.id) ?
                    available :
                    available.push(fromJS(selectedDateDataSet))
                )
            );
    }

    return updatedState
        .setIn(StatePaths.VISUALIZATION_TYPE, content.type)
        .setIn(StatePaths.ITEM_CACHE, updatedItemCache)
        .setIn(StatePaths.BUCKETS, fromJS(updatedMD))
        .setIn(StatePaths.REPORT_LAST_SAVED_OBJECT, fromJS({ visualization: report }))
        .setIn(StatePaths.REPORT_CURRENT_TITLE, report.meta.title)
        .setIn(StatePaths.REPORT_OPENING, false)
        .setIn(StatePaths.RESET_POSSIBLE, true)
        .setIn(StatePaths.REPORT_NOW_OPEN, true)
        .setIn(StatePaths.REPORT_EXECUTION_FIRST, true);
};

export default (state, action) => {
    switch (action.type) {
        case Actions.OPEN_REPORT_STARTED:
            return initiateOpen(state, action);
        case Actions.OPEN_REPORT_FINISHED:
            return openReport(state, action);

        default:
            return state;
    }
};

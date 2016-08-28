import { fromJS } from 'immutable';

import * as Actions from '../constants/Actions';
import * as Paths from '../constants/StatePaths';

import { metricAttributeFilter } from '../models/metric_attribute_filter';
import { isShowPoPValid } from '../models/bucket_rules';

import { getBucketItemPath, removeMetricsFlag } from './buckets_reducer';

function getFiltersPath(state, item) {
    return [...getBucketItemPath(state, item), 'filters'];
}

function setBucketItemAddFilter(state, { item, attribute }) {
    const filtersPath = getFiltersPath(state, item);

    const id = attribute.get('id');

    return state
        .mergeDeepIn(Paths.ITEM_CACHE, { [id]: attribute })
        .updateIn(filtersPath,
            filter => filter.push(metricAttributeFilter({ attribute: id })));
}

function setBucketItemRemoveFilter(state, { item, filter }) {
    let filtersPath = getFiltersPath(state, item);

    return state.setIn(
        filtersPath,
        state.getIn(filtersPath).filterNot(f => f === filter)
    );
}

function setBucketItemUpdateFilter(state, { item, filter, changes }, meta) {
    let filtersPath = getFiltersPath(state, item),
        dateDataSet = state.getIn(Paths.DATE_DATASETS_SELECTED),
        isAutoModified = !!(meta && meta.isAutoModified);

    const updateFilter = f => f
        .merge(fromJS(changes).delete('dateDataSet'))
        .update('isModified', isModified => (isAutoModified ? !!isModified : true));

    return state.setIn(
            filtersPath,
            state.getIn(filtersPath)
                .map(f => (f === filter ? updateFilter(f) : f))
        )
        .setIn(Paths.DATE_DATASETS_SELECTED, changes.dateDataSet || dateDataSet);
}

function sanitize(state) {
    const buckets = state.getIn(Paths.BUCKETS);
    const visType = state.getIn(Paths.VISUALIZATION_TYPE);

    if (!isShowPoPValid(visType, buckets)) {
        return removeMetricsFlag(state, 'showPoP');
    }

    return state;
}

let handlers = {
    [Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER]: setBucketItemUpdateFilter,
    [Actions.BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTER]: setBucketItemAddFilter,
    [Actions.BUCKETS_SET_BUCKET_ITEM_REMOVE_METRIC_FILTER]: setBucketItemRemoveFilter,
    [Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER]: setBucketItemUpdateFilter
};

export default (state, action) => {
    let handler = handlers[action.type];

    return handler ? sanitize(handler(state, action.payload, action.meta)) : state;
};

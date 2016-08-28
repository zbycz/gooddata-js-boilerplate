import * as Actions from '../constants/Actions';
import * as Paths from '../constants/StatePaths';
import { createDateItem, DATE_DATASET_ATTRIBUTE } from '../models/date_item';
import bucketsReducer from '../reducers/buckets_reducer';
import bucketsFilterReducer from '../reducers/bucket_filters_reducer';

export const addItem = (state, bucketName, item) => {
    const type = Actions.BUCKETS_DND_ITEM_INSERT;
    const payload = {
        keyName: bucketName,
        catalogueItem: item
    };
    return bucketsReducer(state, { type, payload });
};

export const setVisualizationType = (state, visualisationType) => {
    const type = Actions.BUCKETS_SELECT_VISUALIZATION_TYPE;
    const payload = visualisationType;
    return bucketsReducer(state, { type, payload });
};

export const findDate = (state, bucketName) =>
    state
        .getIn([...Paths.BUCKETS, bucketName, 'items'])
        .find(item => item.get('attribute') === DATE_DATASET_ATTRIBUTE);

export const ensureDate = (state, bucketName) => {
    let date = findDate(state, bucketName);

    if (!date) {
        return addItem(state, bucketName, createDateItem());
    }

    return state;
};

export const setGranularity = (state, bucketName, value) => {
    const type = Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY;
    const item = findDate(state, bucketName);
    const payload = { item, value };

    return bucketsReducer(state, { type, payload });
};

export const updateItemFilter = (state, bucketName, changes) => {
    let newState = state;

    newState = ensureDate(newState, bucketName);
    const item = findDate(newState, bucketName);
    const filter = item.getIn(['filters', 0]);

    const type = Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER;
    const payload = { filter, item, changes };
    const meta = { isAutoModified: true };

    return bucketsFilterReducer(newState, { type, payload, meta });
};

export const setShowPoP = (state, item, value) => {
    const type = Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_POP;
    const payload = { item, value };

    return bucketsReducer(state, { type, payload });
};

export const setShowInPercent = (state, item, value) => {
    const type = Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT;
    const payload = { item, value };

    return bucketsReducer(state, { type, payload });
};

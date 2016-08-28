import { METRICS, CATEGORIES } from '../constants/bucket';
import { SORT_DIR_ASC, SORT_DIR_DESC } from '../constants/sort_directions';
import { BUCKETS, VISUALIZATION_TYPE } from '../constants/StatePaths';
import { TABLE } from '../constants/visualizationTypes';
import { getBucketItems } from '../selectors/buckets_selector';
import { partial } from 'lodash';

const getDefaultDir = bucketName => {
    switch (bucketName) {
        case METRICS:
            return {
                direction: SORT_DIR_DESC
            };
        default:
            return SORT_DIR_ASC;
    }
};

function isSorted(state, bucketName) {
    return getBucketItems(state, bucketName)
        .some(item => item.get('sort'));
}

function hasAppliedSort(state) {
    return [CATEGORIES, METRICS]
        .some(partial(isSorted, state));
}

function sortByFirstItem(state, bucketName) {
    return state.setIn([...BUCKETS, bucketName, 'items', 0, 'sort'], getDefaultDir(bucketName));
}

function defaultSorting(state) {
    const categories = getBucketItems(state, CATEGORIES);
    if (categories.size) {
        return sortByFirstItem(state, CATEGORIES);
    }

    const metrics = getBucketItems(state, METRICS);
    if (metrics.size) {
        return sortByFirstItem(state, METRICS);
    }

    return state;
}

export function updateSortInfo(state) {
    const visType = state.getIn(VISUALIZATION_TYPE);
    if (visType !== TABLE) { return state; }

    const sorted = hasAppliedSort(state);
    if (sorted) { return state; }

    return defaultSorting(state);
}

import { SORT_TABLE_CHANGE } from '../constants/Actions';
import { BUCKETS } from '../constants/StatePaths';
import { CATEGORIES, METRICS } from '../constants/bucket';
import { getCategoryPath, getMeasurePath } from '../selectors/buckets_selector';

const sortTableChange = (state, { column, index, dir }) => {
    const { type, measureIndex, isPoP } = column;
    let itemPath, sort;

    if (type === 'metric') {
        itemPath = getMeasurePath(state, measureIndex);
        sort = isPoP ? {
            direction: dir,
            sortByPoP: isPoP
        } : {
            direction: dir
        };
    } else {
        itemPath = getCategoryPath(state, index);
        sort = dir;
    }

    return state
        .updateIn([...BUCKETS, CATEGORIES, 'items'], categories => categories.map(category => category.set('sort', null)))
        .updateIn([...BUCKETS, METRICS, 'items'], metrics => metrics.map(metric => metric.set('sort', null)))
        .setIn([...itemPath, 'sort'], sort);
};

export default (state, action) => {
    switch (action.type) {
        case SORT_TABLE_CHANGE:
            return sortTableChange(state, action.payload);

        default:
            return state;
    }
};

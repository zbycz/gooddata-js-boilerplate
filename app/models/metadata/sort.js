import { isObject, isString } from 'lodash';
import { BAR } from '../../constants/visualizationTypes';
import { SORT_DIR_DESC } from '../../constants/sort_directions';

function clearSort(item) {
    item.sort = null;
    return item;
}

function deleteSort(item) {
    const sort = item.sort;
    if (!sort || !(isString(sort) || isObject(sort))) {
        delete item.sort;
    }

    return item;
}

function execOnArray(array, type, fn) {
    return array.map(item => {
        item[type] = fn(item[type]);
        return item;
    });
}

function setOnFirstItem(buckets, direction) {
    if (buckets.measures.length) {
        buckets.measures[0].measure.sort = { direction };
    }

    if (buckets.categories.length) {
        buckets.categories[0].category.sort = direction;
    }

    return buckets;
}

export function applyBarSort(visType, buckets) {
    if (visType === BAR) {
        buckets.measures = execOnArray(buckets.measures, 'measure', clearSort);
        buckets.categories = execOnArray(buckets.categories, 'category', clearSort);
        return setOnFirstItem(buckets, SORT_DIR_DESC);
    }
    return buckets;
}

export function removeEmptySortProperties(buckets) {
    buckets.measures = execOnArray(buckets.measures, 'measure', deleteSort);
    buckets.categories = execOnArray(buckets.categories, 'category', deleteSort);

    return buckets;
}

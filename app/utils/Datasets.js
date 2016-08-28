import { flatten, values } from 'lodash';

export function flattenDatasets(datasets) {
    return flatten(values(datasets));
}

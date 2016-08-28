import { createSelector } from 'reselect';
import { getDecoratedDateDataSets } from './buckets_selector';

export default createSelector(
    getDecoratedDateDataSets,

    dateDataSets => ({ dateDataSets })
);

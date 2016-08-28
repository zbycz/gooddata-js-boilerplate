import { createSelector } from 'reselect';
import { getVisualizationType, getBuckets } from './buckets_selector';
import { isShowInPercentValid, isShowPoPValid } from '../models/bucket_rules';

export default createSelector(
    getVisualizationType,
    getBuckets,

    (visType, buckets) => ({
        isShowInPercentDisabled: !isShowInPercentValid(visType, buckets),
        isShowPoPDisabled: !isShowPoPValid(visType, buckets)
    })
);

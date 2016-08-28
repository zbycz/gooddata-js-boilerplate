import { bucketsToMetadata } from '../models/metadata';
import { INITIAL_MODEL } from '../models/bucket';
import { METRICS } from '../constants/bucket';
import { TABLE } from '../constants/visualizationTypes';

const createBuckets = metric => INITIAL_MODEL.updateIn([METRICS, 'items'],
    metrics => metrics.push(metric)).toJS();

export const getMetricMDObject = metric =>
    ({
        buckets: bucketsToMetadata(TABLE, createBuckets(metric.merge({ showInPercent: false, showPoP: false })))
    });

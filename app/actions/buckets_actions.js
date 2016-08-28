import * as Actions from '../constants/Actions';
import buildMessage from '../utils/message_builder';

import { executeReport } from './report_actions';
import { createReportedAction } from './dnd_actions';

import { logger } from './log_decorator';
import { log } from '../services/logger_service';
import { bucketsFormatter } from './log_formatters';

import { shouldExecuteReportOnFilterChange } from '../selectors/report_selector';


const actionDependencies = {
    log,
    formatter: bucketsFormatter,
    execute: executeReport
};

const createBucketAction = (type, doLog = true, executeOnlyOnValidReport = false) =>
    (payload, dependencies = actionDependencies) => {
        const reportedAction = createReportedAction(type)({
            ...dependencies,
            shouldExecuteReport: executeOnlyOnValidReport ? shouldExecuteReportOnFilterChange : () => true
        });

        return (doLog ? logger(dependencies, reportedAction) : reportedAction)(payload);
    };

export const selectVisualizationType =
    createBucketAction(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE);

export const setBucketItemCollapsed =
    buildMessage(Actions.BUCKETS_SET_BUCKET_ITEM_COLLAPSED);

export const setBucketItemAggregation =
    createBucketAction(Actions.BUCKETS_SET_BUCKET_ITEM_AGGREGATION);

export const setBucketItemShowInPercent =
    createBucketAction(Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT);

export const setBucketItemShowPoP =
    createBucketAction(Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_POP);

export const setBucketItemDateDataSet =
    createBucketAction(Actions.BUCKETS_SET_BUCKET_ITEM_DATE_DATASET);

export const setBucketItemGranularity =
    createBucketAction(Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY);

export const setBucketItemAddFilter =
    (payload, dependencies = actionDependencies) => (
        logger(
            dependencies,
            buildMessage(Actions.BUCKETS_SET_BUCKET_ITEM_ADD_FILTER)
        )(payload)
    );

export const setBucketItemRemoveFilter =
    createBucketAction(Actions.BUCKETS_SET_BUCKET_ITEM_REMOVE_FILTER, true, true);

export const setBucketItemUpdateFilter =
    createBucketAction(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER, true, true);

export const setBucketItemAddMetricFilter =
    buildMessage(Actions.BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTER);

export const setBucketItemRemoveMetricFilter =
    createBucketAction(Actions.BUCKETS_SET_BUCKET_ITEM_REMOVE_METRIC_FILTER, false, true);

export const setBucketItemUpdateMetricFilter =
    createBucketAction(Actions.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER, true, true);

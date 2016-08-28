import { noop, get, set, partial } from 'lodash';

import * as ActionTypes from '../constants/Actions';
import * as Paths from '../constants/StatePaths';

import { getBucketKeyName } from '../reducers/buckets_reducer';
import { getViewport, getDevicePixelRatio, getIsMobileDevice, getIsEmbedded } from '../selectors/bootstrap_selector';
import { getAttribute } from '../models/bucket_item';

function getBucketsStats(state) {
    const buckets = state.getIn(Paths.BUCKETS);

    return buckets
        .reduce((stats, bucket, keyName) => set(stats, keyName, bucket.get('items').size), {});
}

const messageParams = (message = null, params = {}) => ({ message, params });

function getInsertParams(payload, state) {
    return messageParams(
        'adi-bucket-item-insert',
        {
            ...getBucketsStats(state),
            from: 'catalogue',
            to: payload.keyName,
            dragged: payload.catalogueItem.get('type')
        }
    );
}

function getReplaceParams({ bucketItem, catalogueItem }, state) {
    const to = getBucketKeyName(state, bucketItem);
    const dragged = catalogueItem.get('type');

    return messageParams('adi-bucket-item-replace', { from: 'catalogue', to, dragged });
}

function getRemoveParams({ bucketItem }, state) {
    const from = getBucketKeyName(state, bucketItem);
    const dragged = getAttribute(bucketItem, state.getIn(Paths.ITEM_CACHE)).get('type');

    return messageParams('adi-bucket-item-remove', { ...getBucketsStats(state), from, to: 'trash', dragged });
}

function getDragFailedParams(payload, state) {
    const [viewportWidth, viewportHeight] = state.getIn(Paths.DEVICE_VIEWPORT, '0x0').split('x');

    return messageParams(
        'adi-drag-failed',
        {
            mouseX: payload.mouseX,
            mouseY: payload.mouseY,
            from: payload.from,
            dragged: payload.dragged,

            viewportWidth,
            viewportHeight
        }
    );
}

function getSwapParams(payload, state) {
    const { from, to, dragged } = payload.original;
    const params = { from, dragged };

    if (payload.keyName) {
        return messageParams(
            'adi-bucket-item-insert',
            { ...getBucketsStats(state), ...params, to: payload.keyName }
        );
    }

    return messageParams('adi-bucket-item-swap', { ...params, to });
}

export function dnd(action, getState) {
    const Formatters = {
        [ActionTypes.BUCKETS_DND_ITEM_INSERT]: getInsertParams,
        [ActionTypes.BUCKETS_DND_ITEM_REPLACE]: getReplaceParams,
        [ActionTypes.BUCKETS_DND_ITEM_REMOVE]: getRemoveParams,
        [ActionTypes.BUCKETS_DND_ITEM_SWAP]: getSwapParams,
        [ActionTypes.DND_ITEM_DRAG_FAILED]: getDragFailedParams
    };

    return (Formatters[action.type] || (() => messageParams()))(action.payload, getState());
}

function getVisualization(payload) {
    return messageParams('adi-event-visualization-changed', { visualization: payload });
}

function getShowInPercentParams(payload) {
    return messageParams('adi-checkbox-clicked', { name: 'show-in-percent', checked: payload.value });
}

function getShowPopParams(payload) {
    return messageParams('adi-checkbox-clicked', { name: 'show-pop', checked: payload.value });
}

function getAggregationParams(payload) {
    return messageParams('adi-aggregation-function-changed', { name: payload.value });
}

function getFilterParams(isMetricFilter, { changes }) {
    const selectedItemCount = get(changes, 'selectedElements.size');

    if (selectedItemCount) {
        return messageParams(
            isMetricFilter ? 'adi-metric-attribute-filter-apply' : 'adi-attribute-filter-apply',
            {
                selectionSize: changes.isInverted ?
                    changes.totalElementsCount - selectedItemCount : selectedItemCount
            }
        );
    }

    const interval = get(changes, 'interval');

    if (!isMetricFilter && interval) {
        const preset = interval.get('name');
        if (preset) {
            return messageParams('adi-date-filter-preset', { preset });
        }

        return messageParams('adi-date-filter-interval');
    }

    return messageParams();
}

function getDateDataSetParams(payload) {
    return messageParams('adi-date-dataset-changed', {
        option: payload.index,
        relevance: payload.relevance
    });
}

function getGranularityParams(payload) {
    return messageParams('adi-granularity-changed', {
        granularity: payload.value
    });
}

export function bucketsFormatter(action, getState) {
    const Formatters = {
        [ActionTypes.BUCKETS_SELECT_VISUALIZATION_TYPE]: getVisualization,
        [ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_FILTER]: getInsertParams,
        [ActionTypes.BUCKETS_SET_BUCKET_ITEM_REMOVE_FILTER]: getRemoveParams,
        [ActionTypes.BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT]: getShowInPercentParams,
        [ActionTypes.BUCKETS_SET_BUCKET_ITEM_SHOW_POP]: getShowPopParams,
        [ActionTypes.BUCKETS_SET_BUCKET_ITEM_AGGREGATION]: getAggregationParams,
        [ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER]: partial(getFilterParams, false),
        [ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER]: partial(getFilterParams, true),
        [ActionTypes.BUCKETS_SET_BUCKET_ITEM_DATE_DATASET]: getDateDataSetParams,
        [ActionTypes.BUCKETS_SET_BUCKET_ITEM_GRANULARITY]: getGranularityParams
    };

    return (Formatters[action.type] || (() => messageParams()))(action.payload, getState());
}

function getStartedParams(action) {
    return {
        reportId: action.meta.id,
        startTime: action.meta.startTime
    };
}
function getFinishedParams(action) {
    return {
        reportId: action.meta.id,
        startTime: action.meta.startTime,
        endTime: action.meta.endTime,
        statusCode: 200,
        duration: action.meta.endTime - action.meta.startTime
    };
}
function getErrorParams(action) {
    return {
        reportId: action.meta.id,
        startTime: action.meta.startTime,
        endTime: action.meta.endTime,
        statusCode: action.payload.status,
        duration: action.meta.endTime - action.meta.startTime
    };
}

export function reportFormatter(action) {
    const LogMessages = {
        [ActionTypes.REPORT_EXECUTION_STARTED]: 'adi-report-started',
        [ActionTypes.REPORT_EXECUTION_FINISHED]: 'adi-report-finished',
        [ActionTypes.REPORT_EXECUTION_ERROR]: 'adi-report-finished'
    };

    const ParamFormatters = {
        [ActionTypes.REPORT_EXECUTION_STARTED]: getStartedParams,
        [ActionTypes.REPORT_EXECUTION_FINISHED]: getFinishedParams,
        [ActionTypes.REPORT_EXECUTION_ERROR]: getErrorParams
    };

    const message = LogMessages[action.type];

    return {
        message,
        params: (ParamFormatters[action.type] || noop)(action)
    };
}

function getRecommendationsParams(type) {
    return { type };
}

export function recommendationsFormatter(action) {
    const LogMessages = {
        [ActionTypes.RECOMMENDATION_COMPARISON_WITH_PERIOD]: 'adi-recommendation-applied',
        [ActionTypes.RECOMMENDATION_CONTRIBUTION_IN_PERCENT]: 'adi-recommendation-applied',
        [ActionTypes.RECOMMENDATION_METRIC_WITH_PERIOD]: 'adi-recommendation-applied',
        [ActionTypes.RECOMMENDATION_TRENDING]: 'adi-recommendation-applied',
        [ActionTypes.RECOMMENDATION_COMPARISON]: 'adi-recommendation-applied'
    };

    const ParamFormatters = {
        [ActionTypes.RECOMMENDATION_COMPARISON_WITH_PERIOD]: getRecommendationsParams('period-over-period'),
        [ActionTypes.RECOMMENDATION_CONTRIBUTION_IN_PERCENT]: getRecommendationsParams('show-in-percents'),
        [ActionTypes.RECOMMENDATION_METRIC_WITH_PERIOD]: getRecommendationsParams('period-over-period'),
        [ActionTypes.RECOMMENDATION_TRENDING]: getRecommendationsParams('trending'),
        [ActionTypes.RECOMMENDATION_COMPARISON]: getRecommendationsParams('comparison')
    };

    const message = LogMessages[action.type];

    return {
        message,
        params: ParamFormatters[action.type]
    };
}

function getExportStartedParams(action, type) {
    return {
        ...action.meta,
        type
    };
}

function getExportFinishedParams(action, type) {
    return {
        ...action.meta,
        type,
        duration: action.meta.endTime - action.meta.startTime
    };
}

function getExportErrorParams(action, type) {
    delete action.meta.error;
    return {
        ...action.meta,
        type,
        duration: action.meta.endTime - action.meta.startTime
    };
}

export function exportFormatter(action) {
    const LogMessages = {
        [ActionTypes.REPORT_EXPORT_STARTED]: 'adi-export-to-report-started',
        [ActionTypes.REPORT_EXPORT_FINISHED]: 'adi-export-to-report-finished',
        [ActionTypes.REPORT_EXPORT_ERROR]: 'adi-export-to-report-error'
    };

    const ParamFormatters = {
        [ActionTypes.REPORT_EXPORT_STARTED]: getExportStartedParams,
        [ActionTypes.REPORT_EXPORT_FINISHED]: getExportFinishedParams,
        [ActionTypes.REPORT_EXPORT_ERROR]: getExportErrorParams
    };

    return {
        message: 'adi-export-to-report',
        params: (ParamFormatters[action.type || noop])(action, LogMessages[action.type])
    };
}

function catalogueUpdateStarted() {
    return messageParams('adi-catalogue-loading');
}

function catalogueUpdateFinished({ initialLoad, items, totals }) {
    if (initialLoad) {
        const amountByType = {
            metricCount: 0,
            factCount: 0,
            attributeCount: 0
        };

        items.forEach(item => {
            amountByType[`${item.type}Count`] += 1;
        });
        return messageParams('adi-catalogue-ready', { totalCount: totals.available, ...amountByType });
    }

    return messageParams();
}

function catalogueSetActiveDatasetId({ datasetId, preselect }) {
    if (!preselect) {
        return messageParams('adi-dataset-change', datasetId ? { dataset: datasetId } : {});
    }

    if (datasetId) {
        return messageParams('adi-dataset-preselect', { dataset: datasetId });
    }

    return messageParams();
}

export function catalogFormatter(action) {
    const Formatters = {
        [ActionTypes.CATALOGUE_UPDATE_STARTED]: catalogueUpdateStarted,
        [ActionTypes.CATALOGUE_UPDATE_FINISHED]: catalogueUpdateFinished,
        [ActionTypes.CATALOGUE_SET_ACTIVE_DATASET_ID]: catalogueSetActiveDatasetId
    };

    return (Formatters[action.type] || (() => messageParams()))(action.payload);
}

export function shortcutsFormatter(action) {
    const LogMessages = {
        [ActionTypes.SHORTCUT_APPLY_ATTRIBUTE]: 'adi-shortcut-applied',
        [ActionTypes.SHORTCUT_APPLY_METRIC]: 'adi-shortcut-applied',
        [ActionTypes.SHORTCUT_APPLY_METRIC_OVER_TIME]: 'adi-shortcut-applied'
    };

    const ParamFormatters = {
        [ActionTypes.SHORTCUT_APPLY_ATTRIBUTE]: { type: 'shortcut-single-attribute' },
        [ActionTypes.SHORTCUT_APPLY_METRIC]: { type: 'shortcut-single-metric' },
        [ActionTypes.SHORTCUT_APPLY_METRIC_OVER_TIME]: { type: 'shortcut-metric-over-time' }
    };

    const message = LogMessages[action.type];

    return {
        message,
        params: ParamFormatters[action.type] || {}
    };
}

export function deleteFormatter(action) {
    switch (action.type) {
        case ActionTypes.DELETE_REPORT_FINISHED:
            return {
                message: 'adi-report-delete-finished',
                params: { time: action.payload.time }
            };
        case ActionTypes.DELETE_REPORT_ERROR:
            return {
                message: 'adi-report-delete-failed',
                params: { time: action.payload.time }
            };
        default:
            // when message is null, logger ignores it
            return { message: null };
    }
}

export function openFormatter(action) {
    switch (action.type) {
        case ActionTypes.OPEN_REPORT_FINISHED:
            return {
                message: 'adi-report-open-finished',
                params: { time: action.payload.time }
            };
        default:
            // when message is null, logger ignores it
            return { message: null };
    }
}

export function saveFormatter(action) {
    switch (action.type) {
        case ActionTypes.SAVE_REPORT_FINISHED:
            return {
                message: 'adi-report-save-finished',
                params: {
                    saveAsNew: action.payload.saveAsNew, time: action.payload.time
                }
            };
        case ActionTypes.SAVE_REPORT_ERROR:
            return {
                message: 'adi-report-save-failed',
                params: {
                    saveAsNew: action.payload.saveAsNew, time: action.payload.time
                }
            };
        default:
            // when message is null, logger ignores it
            return { message: null };
    }
}

export function resetFormatter({ type }) {
    switch (type) {
        case ActionTypes.RESET_APPLICATION:
            return { message: 'adi-report-reset' };

        default:
            // when message is null, logger ignores it
            return { message: null };
    }
}

export function bootstrapFormatter(action, getState) {
    if (action.type === ActionTypes.APP_READINESS_CHANGE && action.payload.isReady) {
        const state = getState();
        return {
            message: 'adi-app-ready',
            params: {
                deviceViewport: getViewport(state),
                devicePixelRatio: getDevicePixelRatio(state),
                isMobileDevice: getIsMobileDevice(state),
                isEmbedded: getIsEmbedded(state)
            }
        };
    }

    return { message: null };
}

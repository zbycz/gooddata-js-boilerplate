import * as Actions from '../constants/Actions';
import buildMessage from '../utils/message_builder';

import { executeReport } from './report_actions';

import { logger } from './log_decorator';
import { log } from '../services/logger_service';
import { dnd as dndFormatter } from './log_formatters';

const actionDependencies = {
    log,
    formatter: dndFormatter,
    execute: executeReport
};

export const startDragCatalogueItem = item => ({
    type: Actions.DND_ITEM_DRAG_BEGIN,
    payload: {
        item
    }
});

export const endDragCatalogueItem = () => ({
    type: Actions.DND_ITEM_DRAG_END
});

const dragItemFailedPure = payload => ({
    type: Actions.DND_ITEM_DRAG_FAILED,
    payload
});

export const dragItemFailed =
    (payload, dependencies = actionDependencies) => logger(dependencies, dragItemFailedPure)(payload);


export function createReportedAction(type) {
    return ({ execute, shouldExecuteReport = () => true }) => payload => (dispatch, getState) => {
        dispatch(buildMessage(type)(payload));

        if (shouldExecuteReport(getState())) {
            dispatch(execute());
        }
    };
}

const dropCatalogueItemPure = createReportedAction(Actions.BUCKETS_DND_ITEM_INSERT);
export const dropCatalogItem =
    (payload, dependencies = actionDependencies) => logger(dependencies, dropCatalogueItemPure(dependencies))(payload);

const removeBucketItemPure = createReportedAction(Actions.BUCKETS_DND_ITEM_REMOVE);
export const removeBucketItem =
    (payload, dependencies = actionDependencies) => logger(dependencies, removeBucketItemPure(dependencies))(payload);

const replaceBucketItemPure = createReportedAction(Actions.BUCKETS_DND_ITEM_REPLACE);
export const replaceBucketItem =
    (payload, dependencies = actionDependencies) => logger(dependencies, replaceBucketItemPure(dependencies))(payload);

export const swapBucketItemPure = createReportedAction(Actions.BUCKETS_DND_ITEM_SWAP);
export const swapBucketItem =
    (payload, dependencies = actionDependencies) => logger(dependencies, swapBucketItemPure(dependencies))(payload);

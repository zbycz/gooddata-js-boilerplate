import * as StatePaths from '../constants/StatePaths';

import { addItems } from '../reducers/buckets_reducer';
import { METRICS } from '../constants/bucket';
import { List } from 'immutable';
import { currentReportMDObject } from '../selectors/buckets_selector';

function getDraggedItem(state) {
    return state.getIn(StatePaths.ACTIVE_DRAG_ITEM);
}

function getItem(draggedItem) {
    return draggedItem
        .set('attribute', draggedItem.get('identifier'))
        .set('filters', List());
}

function addDraggedItem(state, draggedItem) {
    return addItems(state, METRICS, List([draggedItem]));
}

export function getReportMDObject(state) {
    const draggedItem = getDraggedItem(state);

    const newState = addDraggedItem(state, getItem(draggedItem));

    return currentReportMDObject(newState);
}

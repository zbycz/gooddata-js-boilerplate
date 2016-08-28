import { get, includes, last } from 'lodash';
import * as ActionTypes from '../constants/Actions';
import * as Paths from '../constants/StatePaths';
import { clearActiveDndItem } from './dnd_reducer';
import { setDroppedItem } from './shortcuts_reducer';

let pastStates = [], futureStates = [];

export const whitelistedActions = [
    ActionTypes.BUCKETS_SELECT_VISUALIZATION_TYPE,
    ActionTypes.BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT,
    ActionTypes.BUCKETS_SET_BUCKET_ITEM_SHOW_POP,
    ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_FILTER,
    ActionTypes.BUCKETS_SET_BUCKET_ITEM_REMOVE_FILTER,
    ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER,
    ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTER,
    ActionTypes.BUCKETS_SET_BUCKET_ITEM_REMOVE_METRIC_FILTER,
    ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
    ActionTypes.BUCKETS_SET_BUCKET_ITEM_AGGREGATION,
    ActionTypes.BUCKETS_SET_BUCKET_ITEM_DATE_DATASET,
    ActionTypes.BUCKETS_SET_BUCKET_ITEM_GRANULARITY,

    ActionTypes.BUCKETS_DND_ITEM_INSERT,
    ActionTypes.BUCKETS_DND_ITEM_REMOVE,
    ActionTypes.BUCKETS_DND_ITEM_REPLACE,
    ActionTypes.BUCKETS_DND_ITEM_SWAP,

    ActionTypes.RESET_APPLICATION,

    ActionTypes.SHORTCUT_APPLY_ATTRIBUTE,
    ActionTypes.SHORTCUT_APPLY_METRIC,
    ActionTypes.SHORTCUT_APPLY_METRIC_OVER_TIME,

    ActionTypes.RECOMMENDATION_COMPARISON_WITH_PERIOD,
    ActionTypes.RECOMMENDATION_CONTRIBUTION_IN_PERCENT,
    ActionTypes.RECOMMENDATION_METRIC_WITH_PERIOD,
    ActionTypes.RECOMMENDATION_TRENDING,
    ActionTypes.RECOMMENDATION_COMPARISON,

    ActionTypes.REPORT_TITLE_CHANGE,

    ActionTypes.SORT_TABLE_CHANGE
];

export const updateHistory = (update, where = () => true, states = [...pastStates, ...futureStates]) =>
    states.forEach(state => {
        if (where(state.state)) {
            state.state = update(state.state);
        }
    });

function collapseAllBucketItems(state) {
    return state.updateIn(Paths.BUCKETS_METRICS_ITEMS, items => items.map(item => item.set('collapsed', true)));
}

function copyLastSavedReportIfAny(newState, state) {
    const lastSavedReportContent = state.getIn(Paths.REPORT_CONTENT);

    if (lastSavedReportContent) {
        return newState.setIn(Paths.REPORT_LAST_SAVED_OBJECT, state.getIn(Paths.REPORT_LAST_SAVED_OBJECT));
    }

    return newState;
}

function retainCatalogue(newState, state) {
    return newState.setIn(Paths.CATALOGUE, state.getIn(Paths.CATALOGUE));
}

function copyMessages(newState, state) {
    return newState.setIn(Paths.MESSAGES, state.getIn(Paths.MESSAGES));
}

export function getPast() {
    return [...pastStates];
}

function isResetAction(state) {
    return get(state, 'actionType') === ActionTypes.RESET_APPLICATION;
}

export function isResetDisabledByLastAction() {
    return isResetAction(last(pastStates));
}

const handleTimeTravelChange = (nextData, state) => {
    let newState = collapseAllBucketItems(nextData.state);
    newState = retainCatalogue(newState, state);

    if (nextData.actionType !== ActionTypes.RESET_APPLICATION) {
        newState = copyLastSavedReportIfAny(newState, state);
    }

    newState = clearActiveDndItem(newState);
    newState = setDroppedItem(newState, null);

    return copyMessages(newState, state);
};

const handleUndoRedo = (state, past, future, undoPossible, redoPossible) => {
    if (past.length !== 0) {
        const nextData = past.pop();
        future.push({
            state,
            actionType: nextData.actionType
        });

        return handleTimeTravelChange(nextData, state)
            .setIn(undoPossible, past.length !== 0)
            .setIn(redoPossible, true);
    }

    return state;
};

export default function timeTravelReducer(
    state,
    action,
    past = pastStates,
    future = futureStates
) {
    if (action.type === ActionTypes.UNDO_ACTION) {
        return handleUndoRedo(state, past, future, Paths.UNDO_POSSIBLE, Paths.REDO_POSSIBLE);
    }

    if (action.type === ActionTypes.REDO_ACTION) {
        return handleUndoRedo(state, future, past, Paths.REDO_POSSIBLE, Paths.UNDO_POSSIBLE);
    }

    if (
        (action.type === ActionTypes.SAVE_REPORT_FINISHED && get(action, ['payload', 'saveAsNew'])) ||
        action.type === ActionTypes.OPEN_REPORT_FINISHED ||
        (action.type === ActionTypes.APP_READINESS_CHANGE && get(action, ['payload', 'isReady']))
    ) {
        past.length = 0;
        future.length = 0;

        return state
            .setIn(Paths.UNDO_POSSIBLE, false)
            .setIn(Paths.REDO_POSSIBLE, false);
    }

    if (includes(whitelistedActions, action.type)) {
        past.push({
            state,
            actionType: action.type
        });
        future.length = 0;

        return state
            .setIn(Paths.UNDO_POSSIBLE, true)
            .setIn(Paths.REDO_POSSIBLE, false);
    }

    return state;
}

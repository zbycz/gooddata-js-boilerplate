import * as Paths from '../constants/StatePaths';
import * as Actions from '../constants/Actions';

function setActiveDndItem(state, { item }) {
    return state.setIn(Paths.ACTIVE_DRAG_ITEM, item);
}

export function clearActiveDndItem(state) {
    return state.deleteIn(Paths.ACTIVE_DRAG_ITEM);
}

export default function reducer(state, action) {
    switch (action.type) {
        case Actions.DND_ITEM_DRAG_BEGIN:
            return setActiveDndItem(state, action.payload);
        case Actions.DND_ITEM_DRAG_END:
            return clearActiveDndItem(state);
        default:
            break;
    }
    return state;
}

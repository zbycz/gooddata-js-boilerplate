import initialState from '../reducers/initial_state';

export function createActionStore() {
    const actionLog = [];
    let state = initialState;

    function getState() {
        return state;
    }

    function setState(newState) {
        state = newState;
    }

    function resetState() {
        state = initialState;
    }

    function dispatch(action) {
        if (typeof action === 'function') {
            return action(dispatch, getState);
        }

        actionLog.push(action);

        return action;
    }

    function findAction(predicate) {
        return actionLog.find(predicate);
    }

    function findActionByType(type) {
        return findAction(action => action.type === type);
    }

    function getActionLog() {
        return actionLog;
    }

    return {
        dispatch,
        findAction,
        findActionByType,
        getState,
        setState,
        resetState,
        getActionLog
    };
}

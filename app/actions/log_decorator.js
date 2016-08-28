import { getProjectId } from '../selectors/bootstrap_selector';

function loggedDispatchDecorator(log, formatter, dispatch, getState) {
    return action => {
        const { message, params } = formatter(action, getState) || {};

        if (message) {
            const projectId = getProjectId(getState());
            log(projectId, message, params);
        }

        dispatch(action);
    };
}

export const logger = ({ log, formatter }, actionCreator) => (...payload) => (dispatch, getState) => {
    const loggedDispatch = loggedDispatchDecorator(log, formatter, dispatch, getState);
    const action = actionCreator(...payload);

    if (typeof action === 'function') {
        // got thunk action creator
        return action(loggedDispatch, getState);
    }

    return loggedDispatch(action);
};

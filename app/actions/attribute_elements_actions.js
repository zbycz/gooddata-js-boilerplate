import * as Actions from '../constants/Actions';
import * as API from '../utils/api';

import { isElementRangeLoaded } from '../reducers/attribute_elements_reducer';

const LOAD_PADDING = 25;

function loadElements(dispatch, options, load) {
    let { attribute, filter, start, end } = options;

    return load(attribute, filter, start, end - start)
        .then(result => dispatch({
            type: Actions.ATTRIBUTE_ELEMENTS_UPDATED,
            payload: {
                ...options,
                ...result
            }
        }));
}

export function loadAttributeElements(attribute, filter, reqStart, reqEnd, load = API.loadAttributeElements) {
    return (dispatch, getState) => {
        let state = getState();

        if (isElementRangeLoaded(state, { attribute, filter, start: reqStart, end: reqEnd })) {
            return;
        }

        let start = Math.max(reqStart - LOAD_PADDING, 0),
            end = reqEnd + LOAD_PADDING;

        dispatch({
            type: Actions.ATTRIBUTE_ELEMENTS_UPDATE,
            payload: { attribute, filter, start, end }
        });

        loadElements(dispatch, { attribute, filter, start, end }, load);
    };
}

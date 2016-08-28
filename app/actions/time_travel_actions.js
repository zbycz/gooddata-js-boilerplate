import { partial } from 'lodash';

import { UNDO_ACTION, REDO_ACTION } from '../constants/Actions';
import { startCatalogueUpdate } from './data_actions';

import { logger } from './log_decorator';
import { log } from '../services/logger_service';

const formatter = ({ type }) => {
    switch (type) {
        case UNDO_ACTION:
            return { message: 'adi-event-undo' };
        case REDO_ACTION:
            return { message: 'adi-event-redo' };

        default:
            // when message is null, logger ignores it
            return { message: null };
    }
};

const actionDependencies = {
    log,
    formatter,
    updateCatalogue: startCatalogueUpdate
};

function undoPure({ updateCatalogue }) {
    return dispatch => {
        dispatch({ type: UNDO_ACTION });

        dispatch(updateCatalogue());
    };
}

export const undo =
    (dependecies = actionDependencies) => logger(dependecies, partial(undoPure, dependecies))();

export function redoPure({ updateCatalogue }) {
    return dispatch => {
        dispatch({ type: REDO_ACTION });

        dispatch(updateCatalogue());
    };
}

export const redo =
    (dependecies = actionDependencies) => logger(dependecies, partial(redoPure, dependecies))();

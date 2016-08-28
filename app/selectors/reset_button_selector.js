import { createSelector } from 'reselect';
import * as Paths from '../constants/StatePaths';
import { COLUMN } from '../constants/visualizationTypes';
import { getPast, isResetDisabledByLastAction } from '../reducers/time_travel_reducer';
import { areBucketsEmpty } from './buckets_selector';

function hasNotBeenRenamed(state) {
    const past = getPast();
    const currentTitle = state.getIn(Paths.REPORT_CURRENT_TITLE);

    if (!past.length) {
        return true;
    }

    return past[0].state.getIn(Paths.REPORT_CURRENT_TITLE) === currentTitle;
}

function isDefaultVizType(state) {
    return state.getIn(Paths.VISUALIZATION_TYPE) === COLUMN;
}

export const isResetDisabledSelector = createSelector(
    hasNotBeenRenamed,
    isDefaultVizType,
    state => areBucketsEmpty(state.getIn(Paths.BUCKETS)),

    (isUnrenamedReport, isVizTypeDefault, noBucketsItemsLeft) =>
        isResetDisabledByLastAction() || isUnrenamedReport && isVizTypeDefault && noBucketsItemsLeft
);

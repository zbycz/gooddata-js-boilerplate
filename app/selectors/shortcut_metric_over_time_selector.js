import * as StatePaths from '../constants/StatePaths';
import { createSelector } from 'reselect';

export default createSelector(
    state => state.getIn(StatePaths.SHORTCUT_DATE_DATASETS_LOADED),
    state => state.getIn(StatePaths.SHORTCUT_DATE_DATASETS_AVAILABLE),

    (areDateDataSetsLoaded, availableDateDataSets) => ({
        areDateDataSetsLoaded,
        availableDateDataSets
    })
);

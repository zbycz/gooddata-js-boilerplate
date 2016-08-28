import { createSelector } from 'reselect';
import * as StatePaths from '../constants/StatePaths';

export default createSelector(
    state => state.getIn(StatePaths.CATALOGUE_FILTERS),
    state => state.getIn(StatePaths.CATALOGUE_ACTIVE_FILTER_INDEX),

    (filter, index) => filter.get(index)
);

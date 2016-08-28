import { createSelector } from 'reselect';

import { getProjectId } from './bootstrap_selector';
import * as Paths from '../constants/StatePaths';

export const errorSelector = createSelector(
        getProjectId,
        state => state.getIn(Paths.ERRORS),

        (projectId, errors) => ({ projectId, errors })
);

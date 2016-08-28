import { createSelector } from 'reselect';
import { getAttributeElements } from './buckets_selector';
import { getProjectId } from './bootstrap_selector';

export default createSelector(
    getProjectId,
    getAttributeElements,
    (projectId, elements) => ({ projectId, elements })
);

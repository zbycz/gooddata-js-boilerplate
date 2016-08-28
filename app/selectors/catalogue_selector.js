import { createSelector } from 'reselect';
import { isCsvUploaderEnabled } from './bootstrap_selector';
import * as StatePaths from '../constants/StatePaths';
import { currentReportMDObject } from './buckets_selector';

export default createSelector(
    currentReportMDObject,
    state => state.getIn(StatePaths.CATALOGUE),
    state => state.getIn(StatePaths.DATASETS),
    state => state.getIn(StatePaths.PROJECT_ID),
    isCsvUploaderEnabled,

    (reportMDObject, catalogue, datasets, projectId, enableCsvUploader) => ({
        reportMDObject,
        catalogue,
        datasets,
        projectId,
        enableCsvUploader
    })
);

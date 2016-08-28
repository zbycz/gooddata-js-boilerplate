import {
    getVisualizationType,
    getBuckets,
    getDateDataSets,
    getItemCache
} from '../selectors/buckets_selector';
import * as bucketRules from '../models/bucket_rules';

import * as Paths from '../constants/StatePaths';

import { createSelector } from 'reselect';
import { isReportValid } from './report_selector';

export const displayRecommendationComparisonWithPeriodSelector = createSelector(
    getVisualizationType,
    getBuckets,
    getDateDataSets,
    getItemCache,

    bucketRules.displayRecommendationComparisonWithPeriod
);

export const displayRecommendationContributionInPercentsSelector = createSelector(
    getVisualizationType,
    getBuckets,
    getItemCache,

    bucketRules.displayRecommendationContributionInPercents
);

export const displayRecommendationsMetricWithPeriodSelector = createSelector(
    getVisualizationType,
    getBuckets,
    getDateDataSets,
    getItemCache,

    bucketRules.displayRecommendationMetricWithPeriod
);

export const displayRecommendationsTrendingSelector = createSelector(
    getVisualizationType,
    getBuckets,
    getDateDataSets,
    getItemCache,

    bucketRules.displayRecommendationsTrending
);

export const getAvailableAttributes =
    state => state.getIn(Paths.AVAILABLE_ATTRIBUTES_ITEMS);

export const getComparisonMetric =
    state => state.getIn([...Paths.BUCKETS_METRICS_ITEMS, 0]);

export const displayRecommendationComparisonSelector = createSelector(
    getVisualizationType,
    getBuckets,
    getItemCache,
    getAvailableAttributes,

    bucketRules.displayRecommendationComparison
);

export const displayRecommendationBlockSelector = createSelector(
    displayRecommendationComparisonWithPeriodSelector,
    displayRecommendationContributionInPercentsSelector,
    displayRecommendationsMetricWithPeriodSelector,
    displayRecommendationsTrendingSelector,
    displayRecommendationComparisonSelector,
    isReportValid,

    (
        displayComparisonWithPeriod,
        displayContributionInPercents,
        displayMetricWithPeriod,
        displayTrending,
        displayComparison,
        isValid
    ) =>
        (
            displayComparisonWithPeriod ||
            displayContributionInPercents ||
            displayMetricWithPeriod ||
            displayTrending ||
            displayComparison
        ) &&
        isValid
);

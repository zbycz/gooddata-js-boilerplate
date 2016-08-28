import * as Actions from '../constants/Actions';
import * as Paths from '../constants/StatePaths';
import { logger } from './log_decorator';
import { createReportedAction } from './dnd_actions';
import * as API from '../utils/api';
import { executeReport } from './report_actions';
import { log } from '../services/logger_service';

import { getProjectId } from '../selectors/bootstrap_selector';
import { getComparisonMetric } from '../selectors/recommendations_selector';
import { currentReportMDObject } from '../selectors/buckets_selector';

import { recommendationsFormatter } from './log_formatters';

const actionDependencies = {
    log,
    formatter: recommendationsFormatter,
    execute: executeReport
};

export const applyComparisonWithPeriod =
    (granularity, dependencies = actionDependencies) => (
        logger(
            dependencies,
            createReportedAction(Actions.RECOMMENDATION_COMPARISON_WITH_PERIOD)(dependencies)
        )(granularity)
    );

export const applyContributionInPercents =
    (dependencies = actionDependencies) => (
        logger(
            dependencies,
            createReportedAction(Actions.RECOMMENDATION_CONTRIBUTION_IN_PERCENT)(dependencies)
        )()
    );

export const applyMetricWithPeriod =
    (dependencies = actionDependencies) => (
        logger(
            dependencies,
            createReportedAction(Actions.RECOMMENDATION_METRIC_WITH_PERIOD)(dependencies)
        )()
    );

export const applyTrending =
    (granularity, dependencies = actionDependencies) => (
        logger(
            dependencies,
            createReportedAction(Actions.RECOMMENDATION_TRENDING)(dependencies)
        )(granularity)
    );

export const applyComparison =
    (attribute, dependencies = actionDependencies) => (
        logger(
            dependencies,
            createReportedAction(Actions.RECOMMENDATION_COMPARISON)(dependencies)
        )(attribute)
    );

export const ensureAvailableAttributes =
    (load = API.loadMetricAttributes) =>
        (dispatch, getState) => {
            const state = getState();
            const next = getComparisonMetric(state);
            const nextMetric = next && next.get('attribute');
            const previousMetric = state.getIn(Paths.AVAILABLE_ATTRIBUTES_METRIC);

            if (nextMetric && nextMetric !== previousMetric) {
                dispatch({ type: Actions.AVAILABLE_ATTRIBUTES_UPDATE, payload: { metric: nextMetric } });

                load(getProjectId(state), currentReportMDObject(state), {
                    paging: { limit: 50, offset: 0 }
                })
                    .then(response => dispatch({
                        type: Actions.AVAILABLE_ATTRIBUTES_UPDATED,
                        payload: { items: response.catalog, metric: nextMetric }
                    }));
            }
        };

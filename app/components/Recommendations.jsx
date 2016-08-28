import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { t } from '../utils/translations';
import { GRANULARITY_OPTIONS } from '../models/granularity';

import * as Actions from '../actions/recommendations_actions';

import RecommendationContributionInPercents from './recommendations/RecommendationContributionInPercents';
import RecommendationMetricWithPeriod from './recommendations/RecommendationMetricWithPeriod';
import RecommendationComparisonWithPeriod from './recommendations/RecommendationComparisonWithPeriod';
import RecommendationTrending from './recommendations/RecommendationTrending';
import RecommendationComparison from './recommendations/RecommendationComparison';

import { createSelector } from 'reselect';
import * as selectors from '../selectors/recommendations_selector';

export class Recommendations extends Component {
    static propTypes = {
        applyContributionInPercents: PropTypes.func.isRequired,
        applyMetricWithPeriod: PropTypes.func.isRequired,
        applyComparisonWithPeriod: PropTypes.func.isRequired,
        applyTrending: PropTypes.func.isRequired,
        applyComparison: PropTypes.func.isRequired,
        ensureAvailableAttributes: PropTypes.func.isRequired,
        displayRecommendationBlock: PropTypes.bool.isRequired,
        displayComparisonWithPeriod: PropTypes.bool.isRequired,
        displayContributionInPercents: PropTypes.bool.isRequired,
        displayMetricWithPeriod: PropTypes.bool.isRequired,
        displayTrending: PropTypes.bool.isRequired,
        displayComparison: PropTypes.bool.isRequired,
        comparisonMetric: PropTypes.object,
        availableAttributes: PropTypes.object
    };

    componentDidMount() {
        if (this.props.comparisonMetric) {
            this.props.ensureAvailableAttributes();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.comparisonMetric !== nextProps.comparisonMetric) {
            this.props.ensureAvailableAttributes();
        }
    }

    getContributionInPercents(show) {
        return show && (
            <RecommendationContributionInPercents
                onApply={this.props.applyContributionInPercents}
            />);
    }

    getMetricWithPeriod(show) {
        return show && (
            <RecommendationMetricWithPeriod
                onApply={this.props.applyMetricWithPeriod}
            />);
    }


    getComparisonWithPeriod(show) {
        return show && (
            <RecommendationComparisonWithPeriod
                granularityOptions={GRANULARITY_OPTIONS}
                onApply={this.props.applyComparisonWithPeriod}
            />);
    }

    getTrending(show) {
        return show && (
            <RecommendationTrending
                granularityOptions={GRANULARITY_OPTIONS}
                onApply={this.props.applyTrending}
            />);
    }

    getComparison(show) {
        return show && (
            <RecommendationComparison
                availableAttributes={this.props.availableAttributes}
                onApply={this.props.applyComparison}
            />);
    }

    render() {
        const {
            displayRecommendationBlock,
            displayComparisonWithPeriod,
            displayContributionInPercents,
            displayMetricWithPeriod,
            displayTrending,
            displayComparison
        } = this.props;

        return (displayRecommendationBlock &&
            <div className="adi-recommendations-container">
                <div className="adi-recommendations-title">{t('dashboard.recommendation.recommended_next_steps')}</div>
                {this.getTrending(displayTrending)}
                {this.getComparison(displayComparison)}
                {this.getContributionInPercents(displayContributionInPercents)}
                {this.getComparisonWithPeriod(displayComparisonWithPeriod)}
                {this.getMetricWithPeriod(displayMetricWithPeriod)}
            </div>
        );
    }
}

const recommendationsSelector = createSelector(
    selectors.displayRecommendationBlockSelector,
    selectors.displayRecommendationComparisonWithPeriodSelector,
    selectors.displayRecommendationContributionInPercentsSelector,
    selectors.displayRecommendationsMetricWithPeriodSelector,
    selectors.displayRecommendationsTrendingSelector,
    selectors.displayRecommendationComparisonSelector,
    selectors.getAvailableAttributes,
    selectors.getComparisonMetric,

    (
        displayRecommendationBlock,
        displayComparisonWithPeriod,
        displayContributionInPercents,
        displayMetricWithPeriod,
        displayTrending,
        displayComparison,
        availableAttributes,
        comparisonMetric
    ) => ({
        displayRecommendationBlock,
        displayContributionInPercents,
        displayMetricWithPeriod,
        displayComparisonWithPeriod,
        displayTrending,
        displayComparison,
        availableAttributes,
        comparisonMetric
    })
);

export default connect(recommendationsSelector, Actions)(Recommendations);

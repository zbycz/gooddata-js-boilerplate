import { fromJS } from 'immutable';

import {
    displayRecommendationComparisonWithPeriodSelector,
    displayRecommendationContributionInPercentsSelector,
    displayRecommendationsMetricWithPeriodSelector,
    displayRecommendationBlockSelector,
    displayRecommendationsTrendingSelector } from '../recommendations_selector';
import initialState from '../../reducers/initial_state';
import * as Paths from '../../constants/StatePaths';
import { INITIAL_MODEL } from '../../models/bucket';
import { METRICS, CATEGORIES, FILTERS } from '../../constants/bucket';
import { DATE_DATASET_ATTRIBUTE } from '../../models/date_item';
import * as dimensionsModel from '../../models/date_dataset';
import { INVALID_CONFIGURATION, ENTITY_TOO_LARGE } from '../../constants/Errors';

describe('Recommendations selector test', () => {
    let state;

    beforeEach(() => {
        state = initialState
            .mergeIn(['appState'], {
                bootstrapData: {
                    project: { id: 'my project' }
                }
            })
            .mergeIn(Paths.DATA, fromJS({
                visualizationType: 'column',
                buckets: INITIAL_MODEL
                    .mergeIn([METRICS], fromJS({
                        items: [{ attribute: 'test', showInPercent: false, showPoP: false, filters: [] }]
                    }))
                    .mergeIn([CATEGORIES], fromJS({
                        items: [{ attribute: DATE_DATASET_ATTRIBUTE, filters: [] }]
                    }))
                    .mergeIn([FILTERS], fromJS({
                        items: [
                            { attribute: DATE_DATASET_ATTRIBUTE, filters: [{ interval: { name: 'NOT_ALL_TIME' } }] }
                        ]
                    }))
            }))
            .setIn(Paths.DATE_DATASETS, fromJS({
                available: [{ item: 'test', attributes: [], title: '' }],
                unavailable: 0
            }))
            .setIn(Paths.ITEM_CACHE, fromJS({
                test: { type: 'attribute' }
            }))
            .setIn(Paths.REPORT_EXECUTION_DATA, fromJS({ rawData: [], headers: [] }));
    });


    describe('displayRecommendationComparisonWithPeriodSelector', () => {
        it('should return contribution in percent visible flag set to true', () => {
            state = state
                .setIn([...Paths.BUCKETS, CATEGORIES, 'items', 0, 'attribute'], 'test');

            let shouldShow = displayRecommendationComparisonWithPeriodSelector(state);
            expect(shouldShow).to.equal(true);
        });

        it('should return contribution in percent visible flag set to false', () => {
            state = state
                .setIn([...Paths.BUCKETS, CATEGORIES, 'items', 0, 'attribute'], 'test')
                .setIn([...Paths.BUCKETS, METRICS, 'items', 0, 'showInPercent'], true);

            let shouldShow = displayRecommendationComparisonWithPeriodSelector(state);
            expect(shouldShow).to.equal(false);
        });
    });

    describe('displayRecommendationContributionInPercentsSelector', () => {
        it('should return contribution in percent visible flag set to true', () => {
            state = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items', 0, 'attribute'], 'test');

            let shouldShow = displayRecommendationContributionInPercentsSelector(state);
            expect(shouldShow).to.equal(true);
        });

        it('should return contribution in percent visible flag set to false', () => {
            state = state
                .setIn([...Paths.BUCKETS, CATEGORIES, 'items', 0, 'attribute'], 'test')
                .setIn([...Paths.BUCKETS, METRICS, 'items', 0, 'showInPercent'], true);

            let shouldShow = displayRecommendationContributionInPercentsSelector(state);
            expect(shouldShow).to.equal(false);
        });
    });


    describe('displayRecommendationsMetricWithPeriodSelector', () => {
        it('should return comparsion with period visible flag set to true', () => {
            let shouldShow = displayRecommendationsMetricWithPeriodSelector(state);
            expect(shouldShow).to.equal(true);
        });

        it('should return comparsion with period visible flag set to false', () => {
            state = state.setIn([...Paths.BUCKETS, METRICS, 'items', 0, 'showPoP'], true);

            let shouldShow = displayRecommendationsMetricWithPeriodSelector(state);
            expect(shouldShow).to.equal(false);
        });
    });

    describe('displayRecommendationsTrendingSelector', () => {
        it('should return trending visible flag set to true', () => {
            state = state
                .deleteIn([...Paths.BUCKETS, CATEGORIES])
                .setIn(Paths.DATE_DATASETS, dimensionsModel
                    .INITIAL_MODEL
                    .mergeIn(['available'], fromJS([{ title: 'test' }])));

            let shouldShow = displayRecommendationsTrendingSelector(state);
            expect(shouldShow).to.equal(true);
        });

        it('should return trending visible flag set to false', () => {
            state = state.setIn([...Paths.BUCKETS, METRICS, 'items', 0, 'showPoP'], true);

            let shouldShow = displayRecommendationsTrendingSelector(state);
            expect(shouldShow).to.equal(false);
        });
    });

    describe('displayRecommendationBlockSelector', () => {
        it('should return visible flag set to true', () => {
            let shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).to.equal(true);
        });

        it('should return visible flag set to true if displayRecommendationContributionInPercentsSelector pass', () => {
            state = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items', 0, 'attribute'], 'test');

            let shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).to.equal(true);
        });

        it('should return visible flag set to true if displayRecommendationsMetricWithPeriodSelector pass', () => {
            let shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).to.equal(true);
        });

        it('should return visible flag set to true if displayRecommendationComparisonWithPeriodSelector pass', () => {
            state = state
                .setIn([...Paths.BUCKETS, CATEGORIES, 'items', 0, 'attribute'], 'test');

            let shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).to.equal(true);
        });

        it('should return visible flag set to true if displayRecommendationsTrendingSelector pass', () => {
            state = state
                .mergeIn([...Paths.BUCKETS, CATEGORIES], fromJS({ items: [] }))
                .setIn(Paths.DATE_DATASETS, dimensionsModel
                    .INITIAL_MODEL
                    .mergeIn(['available'], fromJS([{ title: 'test', attributes: [] }])));

            let shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).to.equal(true);
        });

        it('should return visible flag set to false if there is invalid report configuration', () => {
            state = state.setIn([...Paths.REPORT_EXECUTION_ERROR, 'status'], INVALID_CONFIGURATION);

            let shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).to.equal(false);
        });

        it('should return visible flag set to false when report is too large', () => {
            state = state
                .setIn([...Paths.REPORT_EXECUTION_ERROR, 'status'], ENTITY_TOO_LARGE);

            let shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).to.equal(false);
        });

        it('should return visible flag set to false when report is empty', () => {
            state = state
                .mergeIn(Paths.REPORT_EXECUTION_DATA, fromJS({ isEmpty: true }));

            let shouldShow = displayRecommendationBlockSelector(state);
            expect(shouldShow).to.equal(false);
        });
    });
});

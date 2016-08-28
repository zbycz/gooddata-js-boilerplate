import { createSelector } from 'reselect';
import { displayRecommendationBlockSelector } from './recommendations_selector';

export default createSelector(
    displayRecommendationBlockSelector,

    displayRecommendationBlock => ({
        isNarrow: displayRecommendationBlock
    })
);

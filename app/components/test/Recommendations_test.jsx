import { List } from 'immutable';
import React from 'react';
import withIntl from '../../utils/with_intl';
import {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    scryRenderedDOMComponentsWithClass
} from 'react-addons-test-utils';

import { Recommendations } from '../Recommendations';

describe('Recommendations', () => {
    let defaultProps;

    function render(props) {
        const WrappedRecommendations = withIntl(Recommendations);

        return renderIntoDocument((
            <WrappedRecommendations {...props} />
        ));
    }

    beforeEach(() => {
        defaultProps = {
            applyComparisonWithPeriod: sinon.spy(),
            applyContributionInPercents: sinon.spy(),
            applyMetricWithPeriod: sinon.spy(),
            applyTrending: sinon.spy(),
            applyComparison: sinon.spy(),
            ensureAvailableAttributes: sinon.spy(),
            displayRecommendationBlock: false,
            displayComparisonWithPeriod: false,
            displayContributionInPercents: false,
            displayMetricWithPeriod: false,
            displayTrending: false,
            displayComparison: false,
            availableAttributes: List()
        };
    });

    it('should be in blank state by default', () => {
        const recommendations = render(defaultProps);

        const elems = scryRenderedDOMComponentsWithClass(recommendations, 'adi-recommendations-container');
        expect(elems.length).to.eql(0);
    });

    it('should show empty container', () => {
        defaultProps.displayRecommendationBlock = true;
        const recommendations = render(defaultProps);

        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendations-container');
        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendations-title');
    });

    it('should show comparsion with period recommendation', () => {
        defaultProps.displayRecommendationBlock = true;
        defaultProps.displayComparisonWithPeriod = true;
        const recommendations = render(defaultProps);

        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendations-container');
        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendation adi-recommendation-comparison-with-period');
    });

    it('should show contribution in percents recommendation', () => {
        defaultProps.displayRecommendationBlock = true;
        defaultProps.displayContributionInPercents = true;
        const recommendations = render(defaultProps);

        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendations-container');
        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendation adi-recommendation-contribution');
    });

    it('should show metric with period recommendation', () => {
        defaultProps.displayRecommendationBlock = true;
        defaultProps.displayMetricWithPeriod = true;
        const recommendations = render(defaultProps);

        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendations-container');
        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendation adi-recommendation-metric-with-period');
    });

    it('should show trending recommendation', () => {
        defaultProps.displayRecommendationBlock = true;
        defaultProps.displayTrending = true;
        const recommendations = render(defaultProps);

        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendations-container');
        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendation adi-recommendation-trending');
    });

    it('should show comparison recommendation', () => {
        defaultProps.displayRecommendationBlock = true;
        defaultProps.displayComparison = true;
        const recommendations = render(defaultProps);

        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendations-container');
        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendation adi-recommendation-comparison');
    });

    it('should show all recommendations', () => {
        defaultProps.displayRecommendationBlock = true;
        defaultProps.displayComparisonWithPeriod = true;
        defaultProps.displayContributionInPercents = true;
        defaultProps.displayMetricWithPeriod = true;
        defaultProps.displayTrending = true;
        const recommendations = render(defaultProps);

        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendations-container');
        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendation adi-recommendation-comparison-with-period');
        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendation adi-recommendation-contribution');
        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendation adi-recommendation-metric-with-period');
        findRenderedDOMComponentWithClass(recommendations, 'adi-recommendation adi-recommendation-trending');
    });
});

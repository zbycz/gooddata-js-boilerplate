import React, { PropTypes } from 'react';
import { bindAll } from 'lodash';
import { injectIntl } from 'react-intl';
import Button from 'Button/ReactButton';
import Recommendation from './Recommendation';

import { GRANULARITY } from '../../models/granularity';

export class RecommendationComparisonWithPeriod extends React.Component {
    static propTypes = {
        granularityOptions: PropTypes.array.isRequired,
        onApply: PropTypes.func.isRequired,
        intl: PropTypes.shape({ formatMessage: PropTypes.func })
    };

    static defaultProps = {
        granularityOptions: []
    };

    constructor() {
        super();

        this.state = {
            granularity: GRANULARITY.quarter
        };

        bindAll(this, 'apply', 'granularitySelected');
    }

    getRecommendedGranularities(granularities) {
        return granularities.filter(option => option.recommendationLabel);
    }

    granularitySelected(e) {
        this.setState({ granularity: e.target.value });
    }

    apply() {
        this.props.onApply(this.state.granularity);
    }

    renderSelect() {
        let renderOption = granularity => (
            <option key={granularity.dateType} value={granularity.dateType}>
                {granularity.recommendationLabel}
            </option>
        );

        return (
            <select
                className="adi-attribute-switch s-attribute-switch"
                value={this.state.granularity}
                onChange={this.granularitySelected}
            >
                {this.getRecommendedGranularities(this.props.granularityOptions).map(renderOption)}
            </select>
        );
    }

    render() {
        let t = this.props.intl.formatMessage;

        return (
            <Recommendation type="comparison-with-period">
                <h3 className="gd-heading-3">{t({ id: 'recommendation.comparison.contribution_compare' })}</h3>
                {this.renderSelect()}
                <br />
                {t({ id: 'recommendation.comparison.with_same_period' })}
                <br />
                <Button value={t({ id: 'apply' })} className="button-secondary s-apply-recommendation" onClick={this.apply} />
            </Recommendation>
        );
    }
}

export default injectIntl(RecommendationComparisonWithPeriod);

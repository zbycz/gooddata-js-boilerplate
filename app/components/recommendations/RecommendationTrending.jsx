import React, { PropTypes } from 'react';
import { injectIntl } from 'react-intl';
import { bindAll } from 'lodash';
import Button from 'Button/ReactButton';
import Recommendation from './Recommendation';

import { GRANULARITY } from '../../models/granularity';

export class RecommendationTrending extends React.Component {
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
        this.setState({
            granularity: e.target.value
        });
    }

    apply() {
        this.props.onApply(this.state.granularity);
    }

    renderSelect() {
        let renderOption = granularity => (
            <option key={granularity.dateType} value={granularity.dateType}>
                {granularity.label}
            </option>
        );

        let granularities = this.getRecommendedGranularities(this.props.granularityOptions);

        return (
            <select
                className="s-date-granularity-switch"
                value={this.state.granularity}
                onChange={this.granularitySelected}
            >
                {granularities.map(renderOption)}
            </select>
        );
    }

    render() {
        let t = this.props.intl.formatMessage;

        return (
            <Recommendation type="trending">
                <h3 className="gd-heading-3">{t({ id: 'recommendation.trending.see' })}</h3>
                {this.renderSelect()}
                <br />
                {t({ id: 'recommendation.trending.of_last_four_quarters' })}
                <br />
                {t({ id: 'recommendation.trending.in_time_by' })}
                <br />
                <Button value={t({ id: 'apply' })} className="button-secondary s-apply-recommendation" onClick={this.apply} />
            </Recommendation>
        );
    }
}

export default injectIntl(RecommendationTrending);

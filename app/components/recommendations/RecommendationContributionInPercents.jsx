import React, { PropTypes } from 'react';
import { bindAll } from 'lodash';
import { injectIntl } from 'react-intl';
import Button from 'Button/ReactButton';
import Recommendation from './Recommendation';


export class RecommendationContributionInPercents extends React.Component {
    static propTypes = {
        onApply: PropTypes.func.isRequired,
        intl: PropTypes.shape({ formatMessage: PropTypes.func })
    };

    constructor() {
        super();

        bindAll(this, ['onApply']);
    }

    onApply() {
        this.props.onApply();
    }

    render() {
        let t = this.props.intl.formatMessage;

        return (
            <Recommendation type="contribution">
                <h3 className="gd-heading-3">{t({ id: 'recommendation.comparison.percents' })}</h3>
                {t({ id: 'recommendation.comparison.contribution_to_the_whole' })}
                <br />
                <Button value={t({ id: 'apply' })} className="button-secondary s-apply-recommendation" onClick={this.onApply} />
            </Recommendation>
        );
    }
}

export default injectIntl(RecommendationContributionInPercents);

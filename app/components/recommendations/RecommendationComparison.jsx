import { List } from 'immutable';
import { bindAll } from 'lodash';
import { injectIntl } from 'react-intl';
import React, { Component, PropTypes } from 'react';

import Recommendation from './Recommendation';
import Button from 'Button/ReactButton';

export class RecommendationComparison extends Component {
    static propTypes = {
        availableAttributes: PropTypes.object.isRequired,
        onApply: PropTypes.func.isRequired,
        intl: PropTypes.shape({ formatMessage: PropTypes.func })
    };

    static defaultProps = {
        availableAttributes: List()
    };

    constructor(props) {
        super(props);

        bindAll(this, ['onApply']);
    }

    onApply() {
        this.props.onApply(this.select.value);
    }

    renderSelect() {
        return (
            <select
                ref={s => { this.select = s; }}
                className="adi-attribute-switch s-attribute-switch"
            >
                {this.props.availableAttributes.map(attribute => (
                    <option key={attribute.get('identifier')} value={attribute.get('identifier')}>
                        {attribute.get('title')}
                    </option>
                )).toJS()}
            </select>
        );
    }

    render() {
        let t = this.props.intl.formatMessage;

        return (
            <Recommendation type="comparison">
                <h3 className="gd-heading-3">{t({ id: 'recommendation.comparison.compare' })}</h3>

                {t({ id: 'recommendation.comparison.between_each' })}

                {this.renderSelect()}

                <Button
                    className="button-secondary s-apply-recommendation"
                    value={t({ id: 'apply' })}
                    onClick={this.onApply}
                />
            </Recommendation>
        );
    }
}

export default injectIntl(RecommendationComparison);

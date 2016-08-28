import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { t } from '../../../utils/translations';
import * as Actions from '../../../actions/buckets_actions';
import configurationCheckboxesSelector from '../../../selectors/configuration_checkboxes_selector';

import ConfigurationCheckbox from './ConfigurationCheckbox';

export class ConfigurationCheckboxes extends Component {
    static propTypes = {
        bucketItem: PropTypes.object.isRequired,
        setBucketItemShowInPercent: PropTypes.func.isRequired,
        setBucketItemShowPoP: PropTypes.func.isRequired,
        isShowInPercentDisabled: PropTypes.bool,
        isShowPoPDisabled: PropTypes.bool
    };

    static defaultProps = {
        isShowInPercentDisabled: false,
        isShowPoPDisabled: false
    };

    onShowInPercent(value) {
        const item = this.props.bucketItem.get('original');

        this.props.setBucketItemShowInPercent({ item, value });
    }

    onShowPoP(value) {
        const item = this.props.bucketItem.get('original');

        this.props.setBucketItemShowPoP({ item, value });
    }

    render() {
        const { bucketItem, isShowInPercentDisabled, isShowPoPDisabled } = this.props;

        return (
            <div>
                <ConfigurationCheckbox
                    checked={bucketItem.get('showInPercent')}
                    disabled={isShowInPercentDisabled}
                    onChange={value => this.onShowInPercent(value)}
                    label={t('dashboard.bucket_item.show_contribution')}
                    name="show-in-percent"
                />
                <ConfigurationCheckbox
                    checked={bucketItem.get('showPoP')}
                    disabled={isShowPoPDisabled}
                    onChange={value => this.onShowPoP(value)}
                    label={t('dashboard.bucket_item.show_pop')}
                    name="show-pop"
                />
            </div>
        );
    }
}

export default connect(configurationCheckboxesSelector, Actions)(ConfigurationCheckboxes);

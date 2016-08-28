import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import * as Actions from '../../../actions/buckets_actions';
import dateConfigurationSelector from '../../../selectors/date_configuration_selector';

import NoDateAvailable from '../../shared/NoDateAvailable';
import DateDataSetsDropdown from './DateDataSetsDropdown';
import DateGranularityDropdown from './DateGranularityDropdown';

import FlexDimensions from 'goodstrap/packages/core/ReactFlexDimensions';

const DROPDOWN_ITEM_HEIGHT = 23;

export class DateConfiguration extends Component {
    static propTypes = {
        bucketItem: PropTypes.object.isRequired,
        dateDataSets: PropTypes.object.isRequired,
        setBucketItemDateDataSet: PropTypes.func.isRequired,
        setBucketItemGranularity: PropTypes.func.isRequired,
        defaultDialogHeight: PropTypes.number
    };

    static defaultProps = {
        defaultDialogHeight: 0
    };

    constructor(props) {
        super(props);
        this.onDateDataSetChange = this.onDateDataSetChange.bind(this);
        this.onGranularityChange = this.onGranularityChange.bind(this);
    }

    onDateDataSetChange({ id, relevance, index }) {
        const { bucketItem, dateDataSets, setBucketItemDateDataSet } = this.props;
        const dateDataSet = dateDataSets.get('items')
            .find(d => d.get('identifier') === id);

        setBucketItemDateDataSet({
            item: bucketItem.get('original'),
            value: dateDataSet,
            relevance,
            index
        });
    }

    onGranularityChange(granularity) {
        const { bucketItem, setBucketItemGranularity } = this.props;

        setBucketItemGranularity({
            item: bucketItem.get('original'),
            value: granularity.get('dateType')
        });
    }

    getWrapperClasses() {
        return [
            'adi-bucket-configuration',
            's-date-configuration',
            'date-granularity'
        ].join(' ');
    }

    renderConfiguration() {
        const { bucketItem, dateDataSets, defaultDialogHeight } = this.props;
        return (
            <div className={this.getWrapperClasses()}>
                <span className="select">
                    <FormattedMessage id="dashboard.bucket_item.as" />
                    <FlexDimensions className="gd-flex-item-stretch adi-date-dataset-switch">
                        <DateDataSetsDropdown
                            unavailableCount={dateDataSets.get('unavailable')}
                            dateDataSets={dateDataSets.get('items')}
                            activeDateDataSet={bucketItem.get('dateDataSet')}
                            onDateDataSetChange={this.onDateDataSetChange}
                            itemHeight={DROPDOWN_ITEM_HEIGHT}
                            defaultDialogHeight={defaultDialogHeight}
                        />
                    </FlexDimensions>
                </span>

                <span className="select">
                    <FormattedMessage id="dashboard.bucket_item.granularity" />
                    <FlexDimensions className="gd-flex-item-stretch adi-date-granularity-switch">
                        <DateGranularityDropdown
                            granularities={bucketItem.getIn(['dateDataSet', 'attributes'])}
                            activeGranularity={bucketItem.get('granularity')}
                            onGranularityChange={this.onGranularityChange}
                            itemHeight={DROPDOWN_ITEM_HEIGHT}
                            defaultDialogHeight={defaultDialogHeight}
                        />
                    </FlexDimensions>
                </span>
            </div>
        );
    }

    renderNoDateDataSets() {
        return (
            <div className={this.getWrapperClasses()}>
                <NoDateAvailable
                    message="dashboard.bucket_item.no_date_available_category"
                />
            </div>
        );
    }

    render() {
        const { dateDataSets } = this.props;
        const dateDataSetsCount = dateDataSets.get('items').size;

        if (dateDataSetsCount && dateDataSets.get('dateDataSet')) {
            return this.renderConfiguration();
        }

        return this.renderNoDateDataSets();
    }
}

export default connect(dateConfigurationSelector, Actions)(DateConfiguration);

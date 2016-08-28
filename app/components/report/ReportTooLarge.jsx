import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import ReportMessage from './ReportMessage';
import * as Actions from '../../actions/buckets_actions';
import { TABLE } from '../../constants/visualizationTypes';
import { isDataTooLargeToComputeSelector } from '../../selectors/report_selector';

export class ReportTooLarge extends Component {

    static propTypes = {
        isDataTooLargeToCompute: PropTypes.bool.isRequired,
        switchToTable: PropTypes.func.isRequired
    };

    render() {
        const className = 'adi-canvas-message-too-many-data-points s-error-too-many-data-points';

        if (this.props.isDataTooLargeToCompute) {
            return <ReportMessage messageId="too_large_to_compute" className={className} />;
        }

        return (
            <ReportMessage
                messageId="too_large_to_display"
                className={className}
                links={[
                    {
                        messageId: 'switch_to_table',
                        action: this.props.switchToTable
                    }
                ]}
            />
        );
    }
}

function mapStateToProps(state) {
    return { isDataTooLargeToCompute: isDataTooLargeToComputeSelector(state) };
}

function mapDispatchToProps(dispatch) {
    return { switchToTable: () => dispatch(Actions.selectVisualizationType(TABLE)) };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportTooLarge);

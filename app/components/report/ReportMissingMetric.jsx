import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import ReportMessage from './ReportMessage';
import { TABLE } from '../../constants/visualizationTypes';
import * as Actions from '../../actions/buckets_actions';

export class ReportMissingMetric extends Component {
    static propTypes = {
        switchToTable: PropTypes.func.isRequired
    };

    render() {
        return (
            <ReportMessage
                messageId="missing_metric"
                className="adi-canvas-message-missing-metric s-error-missing-metric"
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

function mapDispatchToProps(dispatch) {
    return { switchToTable: () => dispatch(Actions.selectVisualizationType(TABLE)) };
}

export default connect(() => ({}), mapDispatchToProps)(ReportMissingMetric);

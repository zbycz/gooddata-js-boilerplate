import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { isEqual, keys } from 'lodash';

import ReportEmpty from './report/ReportEmpty';
import ReportBlank from './report/ReportBlank';
import ReportTooLarge from './report/ReportTooLarge';
import ReportMissingMetric from './report/ReportMissingMetric';
import ReportComputing from './report/ReportComputing';
import ReportVisualization from './report/ReportVisualization';
import ReportInvalidConfiguration from './report/ReportInvalidConfiguration';
import reportSelector from '../selectors/report_selector';

export class Report extends Component {
    static propTypes = {
        isExecutionRunning: PropTypes.bool,
        isReportTooLarge: PropTypes.bool,
        isInvalidConfiguration: PropTypes.bool,
        isMissingMetric: PropTypes.bool,
        isReportEmpty: PropTypes.bool,
        isComputingShortcut: PropTypes.bool,
        config: PropTypes.object.isRequired,
        data: PropTypes.shape({
            headers: PropTypes.arrayOf(PropTypes.object),
            rawData: PropTypes.arrayOf(PropTypes.array)
        })
    };

    static defaultProps = {
        isExecutionRunning: false,
        isReportTooLarge: false
    };

    shouldComponentUpdate(nextProps) {
        let props = this.props;
        return keys(props).some(prop => (prop === 'config' ? !isEqual(props[prop], nextProps[prop]) : props[prop] !== nextProps[prop]));
    }

    renderCanvas() {
        if (this.props.isMissingMetric) {
            return <ReportMissingMetric />;
        }

        if (this.props.isInvalidConfiguration) {
            return <ReportInvalidConfiguration />;
        }

        if (this.props.isReportTooLarge) {
            return <ReportTooLarge />;
        }

        if (this.props.isExecutionRunning || this.props.isComputingShortcut) {
            return <ReportComputing />;
        }

        if (this.props.isReportEmpty) {
            return <ReportEmpty />;
        }

        if (this.props.data) {
            return (
                <ReportVisualization
                    config={this.props.config}
                    data={this.props.data}
                />
            );
        }

        return <ReportBlank />;
    }

    render() {
        let className = classNames({
            'is-report-ready': this.props.data
        });

        return (
            <div className={className}>
                {this.renderCanvas()}
            </div>
        );
    }
}

export default connect(reportSelector)(Report);

import { noop } from 'lodash';
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import Visualization from 'gdc-indigo-visualizations/src/Visualization';
import Table from 'gdc-indigo-visualizations/src/Table/Table';
import { getCssClass } from '../../utils/css_class';
import reportVisualizationSelector from '../../selectors/report_visualization_selector';
import { dataTooLargeToDisplay } from '../../actions/report_actions';
import * as SortActions from '../../actions/sort_actions';


export function ReportVisualization(visualization) {
    const { config, data, isNarrow, onDataTooLarge, applySortTableChange } = visualization;

    const className = classNames([
        'adi-report-visualization',
        getCssClass(config.type, 's-visualization-')
    ]);

    const containerClassNames = classNames(
        'adi-chart-container',
        {
            'adi-chart-container-narrow': isNarrow
        }
    );

    const tableRenderer = props =>
        <Table {...props} onSortChange={applySortTableChange} />;

    return (
        <div className={className}>
            <div className={containerClassNames}>
                <Visualization
                    config={config}
                    data={data}
                    tableRenderer={tableRenderer}
                    onDataTooLarge={onDataTooLarge}
                />
            </div>
        </div>
    );
}

ReportVisualization.propTypes = {
    isNarrow: PropTypes.bool,
    config: PropTypes.shape({
        type: PropTypes.string.isRequired,
        buckets: PropTypes.object.isRequired
    }).isRequired,
    data: PropTypes.shape({
        headers: PropTypes.arrayOf(PropTypes.object),
        rawData: PropTypes.arrayOf(PropTypes.array)
    }).isRequired,
    applySortTableChange: PropTypes.func,
    onDataTooLarge: PropTypes.func.isRequired
};

ReportVisualization.defaultProps = {
    isNarrow: false,
    applySortTableChange: noop
};

const dispatchToProps = {
    applySortTableChange: SortActions.applySortTableChange,
    onDataTooLarge: dataTooLargeToDisplay
};

export default connect(reportVisualizationSelector, dispatchToProps)(ReportVisualization);

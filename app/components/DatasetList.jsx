import React, { PropTypes, Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
import classNames from 'classnames';

import ReactOverlay from 'core/ReactOverlay';

import { getCssClass } from '../utils/css_class';
import { flattenDatasets } from '../utils/Datasets';
import Dataset from './Dataset.jsx';

export default class DatasetList extends Component {
    static propTypes = {
        allDataDataset: PropTypes.object.isRequired,
        csvUploaderLink: PropTypes.string.isRequired,
        onDatasetChange: PropTypes.func.isRequired,
        datasets: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
        selectedDatasetId: PropTypes.string
    };

    renderDataset(dataset) {
        const isSelected = dataset.identifier === this.props.selectedDatasetId;

        return (
            <Dataset
                key={dataset.identifier}
                dataset={dataset}
                isSelected={isSelected}
                onClick={() => this.props.onDatasetChange(dataset)}
            />
        );
    }

    renderGroup(datasets, groupKey) {
        let classes = classNames(
            groupKey,
            getCssClass(groupKey, 's-dataset-group-')
        );

        return (
            <div key={groupKey} className={classes}>
                <div className="gd-list-item-header"><FormattedMessage id={`datasets.${groupKey}`} /></div>

                {datasets.map(dataset => this.renderDataset(dataset))}
            </div>
        );
    }

    renderGroups() {
        let datasets = this.props.datasets;

        let groupsComponents = Object.keys(datasets).reduce((components, groupKey) => {
            if (datasets[groupKey].length) {
                components.push(this.renderGroup(datasets[groupKey], groupKey));
            }

            return components;
        }, []);

        return (
            <div className="gd-list gd-list-view">
                {this.renderDataset(this.props.allDataDataset)}

                {groupsComponents}
            </div>
        );
    }

    renderCsvUploaderHint() {
        return (
            <p className="csv-uploader-hint s-dataset-csv-uploader-hint">
                <FormattedMessage id="datasets.csv_hint" />
                <br />
                <a target="_blank" href={this.props.csvUploaderLink}>
                    <FormattedMessage id="datasets.upload_file" />
                </a>
            </p>
        );
    }

    render() {
        let noDatasets = isEmpty(flattenDatasets(this.props.datasets));

        return (
            <ReactOverlay
                alignTo=".data-source-picker"
                alignPoints={[{ align: 'bl tl' }]}
                closeOnOutsideClick
                closeOnParentScroll
                closeOnMouseDrag
                onClose={() => this.props.onClose()}
            >
                <div className="gd-dropdown overlay data-source-picker-dropdown">
                    {this.renderGroups()}
                    {noDatasets && this.renderCsvUploaderHint()}
                </div>
            </ReactOverlay>
        );
    }
}

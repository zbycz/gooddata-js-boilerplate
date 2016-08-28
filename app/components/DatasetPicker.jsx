import React, { PropTypes, Component } from 'react';
import { injectIntl } from 'react-intl';

import ReactButton from 'Button/ReactButton';
import classNames from 'classnames';
import { find } from 'lodash';

import { flattenDatasets } from '../utils/Datasets';
import DatasetList from './DatasetList.jsx';
import * as Constants from '../constants/Datasets';

export function getAllDataDataset(name) {
    return {
        identifier: Constants.ALL_DATA_ID,
        name
    };
}

class DatasetPicker extends Component {
    static propTypes = {
        onDatasetChange: PropTypes.func.isRequired,
        datasets: PropTypes.object.isRequired,
        csvUploaderLink: PropTypes.string.isRequired,
        selectedDatasetId: PropTypes.string,
        intl: PropTypes.object.isRequired // injected
    };

    constructor() {
        super();

        this.state = {
            isOpen: false
        };
    }

    getAllDataDataset() {
        return {
            identifier: null,
            name: this.props.intl.formatMessage({ id: Constants.ALL_DATA_TRANSLATIONS_KEY })
        };
    }

    getButtonClassNames() {
        return classNames(
            'button-secondary',
            'button-dropdown',
            'data-source-picker',
            'icon-right',
            's-dataset-picker-toggle',
            {
                'is-active': this.state.isOpen,
                'icon-navigatedown': !this.state.isOpen,
                'icon-navigateup': this.state.isOpen
            }
        );
    }

    getSelectedDataset() {
        let datasets = [
            this.getAllDataDataset(),
            ...flattenDatasets(this.props.datasets)
        ];
        let selected = find(datasets, { identifier: this.props.selectedDatasetId });
        return selected || this.getAllDataDataset();
    }

    closeDatasetList() {
        this.setState({
            isOpen: false
        });
    }

    toggleButton() {
        this.setState({ isOpen: !this.state.isOpen });
    }

    renderButton() {
        let selectedDataset = this.getSelectedDataset();

        return (
            <ReactButton
                className={this.getButtonClassNames()}
                onClick={() => this.toggleButton()}
                value={selectedDataset.name}
            />
        );
    }

    renderList() {
        if (!this.state.isOpen) {
            return null;
        }

        const changeDataset = dataset => {
            this.closeDatasetList();

            this.props.onDatasetChange(dataset.identifier);
        };

        return (
            <DatasetList
                {...this.props}
                onDatasetChange={changeDataset}
                onClose={() => this.closeDatasetList()}
                allDataDataset={this.getAllDataDataset()}
            />
        );
    }

    render() {
        return (
            <div className="data-source-picker-wrapper">
                {this.renderButton()}

                {this.renderList()}
            </div>
        );
    }
}

export default injectIntl(DatasetPicker);

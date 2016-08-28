import React, { PropTypes, Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
import { partial } from 'lodash';

import * as Api from '../utils/api';
import { loadDateDataSetsAndCatalog, loadCatalogueItems } from '../services/catalogue_service';

import CatalogueDataSource from '../components/catalogue/CatalogueDataSource';

import catalogueSelector from '../selectors/catalogue_selector';
import CatalogueFilter from '../components/catalogue/CatalogueFilter';
import CatalogueList from '../components/catalogue/CatalogueList';
import DatasetPicker from '../components/DatasetPicker';
import UploaderLink from '../components/catalogue/UploaderLink';
import SearchField from 'Form/ReactSearchField';
import Trash from '../components/catalogue/Trash.jsx';

import * as DataActions from '../actions/data_actions';
import * as DnDActions from '../actions/dnd_actions';
import * as FilterActions from '../actions/buckets_actions';
import * as ItemTypes from '../constants/DragItemTypes';


class Catalogue extends Component {
    static propTypes = {
        reportMDObject: PropTypes.object.isRequired,
        datasets: PropTypes.object.isRequired,
        catalogue: PropTypes.object.isRequired,
        enableCsvUploader: PropTypes.bool,
        projectId: PropTypes.string,
        dispatch: PropTypes.func.isRequired, // injected
        intl: PropTypes.object.isRequired, // injected
        onDropBucketItem: PropTypes.func.isRequired, // injected
        connectDropTarget: PropTypes.func.isRequired, // injected,
        isDragging: PropTypes.bool.isRequired, // injected
        isOver: PropTypes.bool.isRequired, // injected

        loadDateDataSetsAndCatalog: PropTypes.func,
        loadCatalogueItems: PropTypes.func
    };

    static defaultProps = {
        showDatasetPicker: false,
        enableCsvUploader: false,
        loadDateDataSetsAndCatalog,
        loadCatalogueItems
    };

    constructor(props) {
        super(props);

        this.handleShowBubble = this.handleShowBubble.bind(this);
        this.renderCatalogueList = this.renderCatalogueList.bind(this);

        this.loadQuery = partial(props.loadDateDataSetsAndCatalog, props.dispatch, props.projectId);
        this.loadPaged = partial(props.loadCatalogueItems, props.projectId);
    }

    onQueryChange(query) {
        this.props.dispatch(DataActions.setCatalogueQuery(query));
    }

    onActiveFilterChange(activeFilterIndex) {
        this.props.dispatch(DataActions.setCatalogueFilter(activeFilterIndex));
    }

    onDatasetChange(selectedDatasetId) {
        this.props.dispatch(DataActions.datasetSelectRequested(window, selectedDatasetId));
    }

    getFilterAtIndex(index) {
        let catalogue = this.props.catalogue;
        let filters = catalogue.get('filters');
        return filters.get(index).toJS();
    }

    getActiveFilter() {
        return this.getFilterAtIndex(this.props.catalogue.get('activeFilterIndex'));
    }


    handleShowBubble(item) {
        if (!item.get('details')) {
            this.props.dispatch(DataActions.catalogueItemDetailRequested(item.toJS()));
        }
    }

    renderUploaderLink() {
        if (this.props.enableCsvUploader) {
            return <UploaderLink href={Api.getCsvUploaderUrl(this.props.projectId)} />;
        }

        return null;
    }

    renderCatalogueList(dataSource) {
        return (
            <CatalogueList {...dataSource} onShowBubble={this.handleShowBubble} />
        );
    }

    renderCatalog() {
        let showDatasetPicker = this.props.enableCsvUploader;

        let catalogue = this.props.catalogue;

        let catalogueFilters = catalogue.get('filters').toJS();
        let activeFilterIndex = catalogue.get('activeFilterIndex');

        let csvUploaderLink = Api.getCsvUploaderUrl(this.props.projectId);

        let datasetPicker = showDatasetPicker && (
            <div className="adi-dataset-picker">
                <DatasetPicker
                    datasets={this.props.datasets.toJS()}
                    selectedDatasetId={this.props.catalogue.get('activeDatasetId')}
                    onDatasetChange={dataset => this.onDatasetChange(dataset)}
                    onShowBubble={this.handleShowBubble}
                    csvUploaderLink={csvUploaderLink}
                />
            </div>
        );

        return (
            <div className="adi-catalogue">
                {datasetPicker}

                <div className="catalogue-search">
                    <SearchField
                        small
                        onChange={query => this.onQueryChange(query)}
                        value={catalogue.get('query')}
                        placeholder={this.props.intl.formatMessage({ id: 'search_data' })}
                    />
                </div>

                <div className="adi-catalogue-filter">
                    <CatalogueFilter
                        filters={catalogueFilters}
                        activeFilterIndex={activeFilterIndex}
                        onSelect={filterIndex => this.onActiveFilterChange(filterIndex)}
                    />
                </div>

                <div className="catalogue-list-container adi-catalogue-list">

                    <CatalogueDataSource
                        projectId={this.props.projectId}
                        dataSetIdentifier={this.props.catalogue.get('activeDatasetId')}
                        searchQuery={catalogue.get('query')}
                        reportMDObject={this.props.reportMDObject}
                        activeFilter={catalogueFilters[activeFilterIndex]}
                        dispatch={this.props.dispatch}
                        loadQuery={this.loadQuery}
                        loadPaged={this.loadPaged}
                    >
                        {this.renderCatalogueList}
                    </CatalogueDataSource>

                </div>
            </div>
        );
    }

    render() {
        const { isDragging, connectDropTarget, isOver } = this.props;

        return connectDropTarget(
            <div className="adi-catalogue-section">
                <div className={classNames('adi-trash-panel', { invisible: !isDragging })}>
                    <Trash isOver={isOver} />
                </div>
                <div className={classNames('adi-catalogue-panel', 's-catalogue', { invisible: isDragging })}>
                    {this.renderCatalog()}

                    {this.renderUploaderLink()}
                </div>
            </div>
        );
    }
}

export const Pure = injectIntl(Catalogue);

export const dropConfig = {
    drop({ onDropBucketItem, onDropFilterItem, dispatch }, monitor) {
        const dropData = monitor.getItem();

        if (dropData.from === 'filters') {
            onDropFilterItem(dropData);
        } else {
            onDropBucketItem(dropData);
        }
    }
};

function collect(connectDnd, monitor) {
    return {
        connectDropTarget: connectDnd.dropTarget(),
        isDragging: monitor.canDrop(),
        isOver: monitor.isOver()
    };
}

export function mapDispatchToProps(dispatch) {
    return {
        dispatch,
        onDropBucketItem(data) {
            dispatch(DnDActions.removeBucketItem(data));
        },
        onDropFilterItem(data) {
            dispatch(FilterActions.setBucketItemRemoveFilter(data));
        }
    };
}

export const Target = DropTarget(ItemTypes.BUCKET_ITEM, dropConfig, collect)(Pure);

export default connect(catalogueSelector, mapDispatchToProps)(Target);

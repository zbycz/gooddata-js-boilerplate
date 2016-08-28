import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { merge, bindAll } from 'lodash';
import { t } from '../../utils/translations';
import { fromJS } from 'immutable';

import createVisualizationsDataSource from 'goodstrap/packages/data/VisualizationsDataSource';
import Dropdown, { DropdownButton, DropdownBody } from 'goodstrap/packages/Dropdown/ReactDropdown';
import NoData from 'goodstrap/packages/data/ReactNoData';
import VisualizationsDataSourceWrapper, { tabDefinitions } from 'goodstrap/packages/data/VisualizationsDataSourceWrapper';
import List from 'goodstrap/packages/List/ReactList';
import VisualizationsListItem from 'goodstrap/packages/List/ReactVisualizationsListItem';

import { getProjectId } from '../../selectors/bootstrap_selector';

import * as StatePaths from '../../constants/StatePaths';
import * as OpenActions from '../../actions/open_actions';
import * as DeleteActions from '../../actions/delete_actions';

import { canOpenReport } from '../../selectors/open_report_selector';
import { lastSavedReportSelector } from '../../selectors/report_selector';

export class VisualizationsDropdown extends Component {
    static propTypes = {
        projectId: PropTypes.string.isRequired,
        isLoading: PropTypes.bool,
        isDisabled: PropTypes.bool,
        dataSource: PropTypes.object,
        openReport: PropTypes.func,
        deleteReport: PropTypes.func,
        selectedItems: PropTypes.array,
        lastSavedReport: PropTypes.object
    };

    static defaultProps = {
        selectedItems: [],
        openReport: () => {},
        deleteReport: () => {},
        isDisabled: true
    };

    constructor(props) {
        super(props);

        bindAll(this, ['deleteReport', 'reportSelected', 'filterChanged', 'onOpenStateChanged']);
        const { dataSource } = props;

        this.state = {
            dataSource,
            filterConfig: {
                searchString: '',
                tab: tabDefinitions[0]
            }
        };
    }

    onOpenStateChanged(open) {
        if (!open) {
            const filterConfig = {
                ...this.state.filterConfig,
                searchString: ''
            };

            this.setState({
                filterConfig
            });
        }
    }

    getButtonValue() {
        const [selectedItem] = this.props.selectedItems;

        if (selectedItem && selectedItem.title) {
            return selectedItem.title;
        }

        return t('openReportPlaceholder');
    }

    reportSelected(report) {
        this.props.openReport({ report });
    }

    deleteReport(payload) {
        if (this.refs.dropdown) {
            this.refs.dropdown.closeDropdown();
        }

        this.props.deleteReport({
            report: fromJS(payload)
        });
    }

    filterChanged(filterConfig) {
        this.setState({
            filterConfig: {
                ...this.state.filterConfig,
                ...filterConfig
            }
        });
    }

    render() {
        const buttonValue = this.getButtonValue();
        const selectedItem = this.props.lastSavedReport ? this.props.lastSavedReport.toJS() : null;

        return (
            <Dropdown
                ref="dropdown"
                className="s-report_select report-select"
                disabled={this.props.isDisabled}
                alignPoints={[{
                    align: 'br tr'
                }]}
                closeOnMouseDrag
                onOpenStateChanged={this.onOpenStateChanged}
                button={<DropdownButton
                    title={buttonValue}
                    value={buttonValue}
                    isSmall={false}
                    className="type-metric"
                />}
                body={
                    <VisualizationsDataSourceWrapper
                        dataSource={this.state.dataSource}
                        filterConfig={this.state.filterConfig}
                        onFilterChange={this.filterChanged}
                        searchPlaceholder={t('search_insights')}
                    >
                        <DropdownBody
                            List={List}
                            className="open-visualizations"
                            onSelect={this.reportSelected}
                            itemHeight={40}
                            width={250}
                            searchPlaceholder={'placeholder'}
                            maxVisibleItemsCount={5}
                            rowItem={<VisualizationsListItem
                                visualizationDeleteRequested={this.deleteReport}
                                selectedItem={selectedItem}
                                unlistedTitle={'unlistedMetricIconTitle'}
                            />}
                            noData={
                                <NoData
                                    notFoundLabel={t('visualizationsList.noVisualizationsFound')}
                                    noDataLabel={t('visualizationsList.noVisualizations')}
                                />
                            }
                        />
                    </VisualizationsDataSourceWrapper>
                }
            />
        );
    }
}

const mapStateToProps = state => {
    const projectId = getProjectId(state);
    const userUri = state.getIn(StatePaths.USER_URI);

    return {
        lastSavedReport: lastSavedReportSelector(state),
        projectId,
        dataSource: createVisualizationsDataSource({ projectId, orderBy: 'updated', author: userUri }),
        isDisabled: !canOpenReport(state)
    };
};

const mapDispatchToProps = merge({}, OpenActions, DeleteActions);

export default connect(mapStateToProps, mapDispatchToProps)(VisualizationsDropdown);

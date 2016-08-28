// React not needed since there's no JSX here
import { Component, PropTypes } from 'react';
import { isEqual, debounce } from 'lodash';
import { startCatalogueUpdate, catalogueUpdated } from '../../actions/data_actions';
import DataSource from '../../utils/data_source';


const INITIAL_STATE = {
    isLoading: true,
    data: {
        totalCount: 0,
        items: []
    },
    meta: {
        query: {},
        offset: 0
    }
};

const DEBOUNCE_MILISECONDS = 300;


class CatalogueDataSource extends Component {
    static propTypes = {
        projectId: PropTypes.string.isRequired,
        dataSetIdentifier: PropTypes.string,

        pageSize: PropTypes.number,
        initialPageSize: PropTypes.number,
        searchQuery: PropTypes.string,
        reportMDObject: PropTypes.object,
        activeFilter: PropTypes.object,

        loadQuery: PropTypes.func.isRequired,
        loadPaged: PropTypes.func.isRequired,

        children: PropTypes.func.isRequired,
        dispatch: PropTypes.func.isRequired
    };

    static defaultProps = {
        pageSize: 10,
        initialPageSize: 100
    };

    constructor(props) {
        super(props);

        this.queryDataSource = debounce(this.queryDataSource, DEBOUNCE_MILISECONDS);
        this.handleData = this.handleData.bind(this);

        this.dataSource = new DataSource(
            props.loadQuery,
            props.loadPaged,
            { pageSize: props.pageSize }
        );

        this.state = INITIAL_STATE;
    }

    componentDidMount() {
        this.dataSource.onChange(this.handleData);
        this.queryDataSource(this.props, this.dataSource);
    }

    componentWillReceiveProps(newProps) {
        const filterChanged = this.props.searchQuery !== newProps.searchQuery;
        const dataSetChanged = this.props.dataSetIdentifier !== newProps.dataSetIdentifier;
        const typesChanged = !isEqual(this.props.activeFilter, newProps.activeFilter);
        const availabilityChanged = !isEqual(this.props.reportMDObject, newProps.reportMDObject);
        const hasSearchResult = this.state.data.totalCount !== 0;

        if (filterChanged || typesChanged || dataSetChanged || (hasSearchResult && filterChanged)) {
            this.setState(INITIAL_STATE);

            if (availabilityChanged) {
                this.setState({
                    isLoading: false,
                    isLoadingAvailability: true,
                    data: this.state.data
                });
            }
            this.queryDataSource(newProps, this.dataSource);
        }
    }

    componentWillUnmount() {
        this.dataSource.resetChangeSubscriptions();
    }

    queryDataSource(props, dataSource) {
        const {
            dispatch,
            dataSetIdentifier,
            searchQuery,
            activeFilter,
            initialPageSize,
            reportMDObject
        } = props;

        dispatch(startCatalogueUpdate());

        const query = {
            filter: searchQuery,
            activeFilter,
            types: activeFilter.types,
            paging: {
                offset: 0,
                limit: initialPageSize
            },
            bucketItems: reportMDObject,
            dataSetIdentifier
        };

        dataSource.getData(query);
    }

    handleData(event) {
        try {
            this.setState({
                data: event.data,
                meta: event.meta,
                isLoadingAvailability: false,
                isLoading: false
            });

            if (!event.initialLoad) {
                this.props.dispatch(catalogueUpdated({ ...event, initialLoad: false }));
            }
        } catch (e) {
            debounce(this.handleData, DEBOUNCE_MILISECONDS)(event);
        }
    }

    render() {
        return this.props.children({
            ...this.state,
            getObjectAt: this.dataSource.getRowAt
        });
    }
}

export default CatalogueDataSource;

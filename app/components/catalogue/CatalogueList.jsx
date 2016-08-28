import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { FormattedMessage } from 'react-intl';
import { bindAll } from 'lodash';
import CustomEvent from 'custom-event';

import { PROJECT_HEADER_OFFSET } from '../../services/catalogue_service';
import * as Paths from '../../constants/StatePaths';

import { LIST_ITEM_HEIGHT } from './CatalogueListItem';
import CatalogueListItemContainer from './CatalogueListItemContainer';
import LoadingCatalogueListItem from './LoadingCatalogueListItem';
import Spinner from './Spinner';
import CatalogueEmpty from './CatalogueEmpty';

import ReactList from 'List/ReactList';

import { Observable } from 'rxjs/Rx';

const FOOTER_HEIGHT = 30;
const TOP_LIST_PADDING = 10;
const LIST_WIDTH = 229;
const RESIZE_EVENT_DEBOUNCE_MILISECONDS = 120;

let CatalogueItem = ({ item, onShowBubble }) => (
    item ?
        <CatalogueListItemContainer item={item} available onShowBubble={onShowBubble} /> :
        <LoadingCatalogueListItem />
);

CatalogueItem.propTypes = { item: PropTypes.object, onShowBubble: PropTypes.func };

CatalogueItem = connect((state, { item }) => {
    if (!item) {
        return { item };
    }

    if (item.type === 'date' || item.type === 'header') {
        return {
            item: fromJS(item)
        };
    }

    return {
        item: state.getIn([...Paths.ITEM_CACHE, item.id])
    };
})(CatalogueItem);


export default class CatalogueList extends Component {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        data: PropTypes.shape({
            items: PropTypes.array,
            totalCount: PropTypes.number,
            unavailableItemsCount: PropTypes.number
        }).isRequired,
        meta: PropTypes.shape({
            query: PropTypes.shape({
                filter: PropTypes.string
            }).isRequired,
            offset: PropTypes.number.isRequired
        }).isRequired,
        getObjectAt: PropTypes.func.isRequired,
        isLoadingAvailability: PropTypes.bool,
        onShowBubble: PropTypes.func.isRequired
    };

    static defaultProps = {
        // not implemented yet
        isLoadingAvailability: false,
        unavailableItemsCount: 0
    };

    constructor(props) {
        super(props);

        this.state = { listHeight: null };

        this.resizeObserver = null;

        bindAll(this, 'onScroll');
    }

    componentDidMount() {
        this.onWindowResized = () => {
            this.setState({ listHeight: null });
        };

        this.resizeObserver = Observable.fromEvent(window, 'resize')
            .debounceTime(RESIZE_EVENT_DEBOUNCE_MILISECONDS)
            .subscribe(this.onWindowResized);
        this.updateListHeight(this.props);
    }

    componentWillReceiveProps(nextProps, nextState) {
        const startedLoading = this.props.isLoadingAvailability !== nextProps.isLoadingAvailability;
        const unavailableChanged = this.props.data.unavailableItemsCount !== nextProps.data.unavailableItemsCount;

        if (nextState.listHeight === null || startedLoading || unavailableChanged) {
            this.updateListHeight(nextProps);
        }
    }

    componentDidUpdate() {
        if (this.state.listHeight === null) {
            this.updateListHeight(this.props);
        }
    }

    componentWillUnmount() {
        this.resizeObserver.unsubscribe();
        this.resizeObserver = null;
    }

    onScroll() {
        const node = ReactDOM.findDOMNode(this);
        node.dispatchEvent(new CustomEvent('goodstrap.scrolled', { bubbles: true }));
    }

    calculateListHeight({ isLoadingAvailability, data: { unavailableItemsCount } }) {
        const node = ReactDOM.findDOMNode(this);
        const referentialNode = node.parentNode;
        const height = Math.ceil(referentialNode.offsetHeight);
        const pxToSubtract = (isLoadingAvailability || unavailableItemsCount) ? FOOTER_HEIGHT : 0;

        return Math.max(height - pxToSubtract, 0);
    }

    updateListHeight(props) {
        this.setState({ listHeight: this.calculateListHeight(props) });
    }

    isSearchResultEmpty() {
        const isSearched = this.props.meta.query.filter;
        const hasNoCatalogueItems = this.props.data.totalCount - this.props.meta.offset === 0;

        return isSearched && hasNoCatalogueItems;
    }

    listItemHeightGetter(idx) {
        if (idx === 0) {
            return LIST_ITEM_HEIGHT + TOP_LIST_PADDING;
        }
        return LIST_ITEM_HEIGHT;
    }

    listHasObjects() {
        const totalCount = this.props.data.totalCount - PROJECT_HEADER_OFFSET;
        const isSearched = this.props.meta.query.filter;
        return totalCount !== 0 || isSearched;
    }

    _renderAvailabilitySpinner() {
        if (this.props.isLoadingAvailability) {
            return (
                <footer className="availability-spinner">
                    <div>
                        <Spinner />
                        <FormattedMessage id="catalogue.loading_availability" />&hellip;
                    </div>
                </footer>
            );
        }

        return null;
    }

    _renderUnavailableItemsCount() {
        const { isLoadingAvailability } = this.props;
        const { unavailableItemsCount } = this.props.data;

        if (!isLoadingAvailability && unavailableItemsCount) {
            const message = <FormattedMessage id="catalogue.unavailable_items_matched" values={{ count: unavailableItemsCount }} />;

            return (
                <footer>
                    <div className="s-unavailable-items-matched">{message}</div>
                </footer>
            );
        }

        return null;
    }

    _renderNoObjectsFound() {
        if (!this.listHasObjects()) {
            return (
                <div className="adi-no-objects s-no-objects-found">
                    <FormattedMessage id="catalogue.no_objects_found" />
                </div>
            );
        }

        return null;
    }

    _renderList() {
        if (this.listHasObjects()) {
            const listDataSource = {
                rowsCount: this.props.data.totalCount,
                getObjectAt: this.props.getObjectAt
            };
            return (
                <div className="adi-catalogue-list">
                    <ReactList
                        compensateBorder={false}
                        dataSource={listDataSource}
                        itemHeight={LIST_ITEM_HEIGHT}
                        itemHeightGetter={this.listItemHeightGetter}
                        height={this.state.listHeight}
                        width={LIST_WIDTH}
                        rowItem={<CatalogueItem onShowBubble={this.props.onShowBubble} />}
                        onScrollStart={this.onScroll}
                    />
                </div>
            );
        }

        return null;
    }

    render() {
        if (this.props.isLoading || this.state.listHeight === null) {
            // in case height was not calculated yet, render spinner to avoid blink
            return <Spinner />;
        }

        if (this.isSearchResultEmpty()) {
            return (
                <div className="catalogue-list">
                    <CatalogueEmpty search={this.props.meta.query.filter} />
                    {this._renderUnavailableItemsCount()}
                </div>
            );
        }

        return (
            <div className="catalogue-list s-catalogue-loaded">
                {this._renderList()}
                {this._renderNoObjectsFound()}
                {this._renderAvailabilitySpinner()}
                {this._renderUnavailableItemsCount()}
            </div>
        );
    }
}

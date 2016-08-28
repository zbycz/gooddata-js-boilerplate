import React, { PropTypes } from 'react';
import { injectIntl } from 'react-intl';
import ReactDOM from 'react-dom';
import { fromJS } from 'immutable';
import { memoize, bindAll } from 'lodash';
import classNames from 'classnames';
import CustomEvent from 'custom-event';
import invariant from 'invariant';

import MetricAttributeListItem from './MetricAttributeListItem.jsx';
import LoadingList from '../shared/LoadingList';
import NoResultsList from '../shared/NoResultsList';

import Button from 'Button/ReactButton';
import List from 'List/ReactList';

import ReactOverlay from 'core/ReactOverlay';
import SearchField from 'Form/ReactSearchField';

import { loadDetails } from '../../services/catalogue_details_loader';
import {
    DROPDOWN_ALIGMENTS,
    subscribeEvents,
    getDialogHeight
} from '../../utils/dropdown';

const cachedLoader = memoize(
    item => loadDetails(item),
    item => item.identifier
);

const ITEM_HEIGHT = 28;
const LIST_WIDTH = 208;
const SEARCHBOX_HEIGHT = 41;
const PADDING = 14;
const CONTENT_PADDING = 2;


class MetricAttributeFilter extends React.Component {
    static propTypes = {
        dataSourceCreator: PropTypes.func.isRequired,
        onSelect: PropTypes.func,
        intl: React.PropTypes.shape({
            formatMessage: React.PropTypes.func
        }),
        dialogHeight: PropTypes.number
    };

    static defaultProps = {
        dialogHeight: 300
    };

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            displayDropdown: false,
            firstLoad: true,
            searchString: '',
            button: null,
            dialogHeight: props.dialogHeight
        };

        bindAll(this, ['onShowBubble', 'onDropdownToggle', 'onSelect', 'onSearch', 'onScroll', 'setDialogHeight']);
    }

    componentDidMount() {
        this.dataSource = this.props.dataSourceCreator();

        invariant(this.dataSource, 'Data source was not created.');

        this.setLoadingFlag = options => this.setState(options);
        this.dataSource.isLoading$.onValue(this.setLoadingFlag);

        this.onRowsUpdated = () => this.forceUpdate();
        this.dataSource.data$.onValue(this.onRowsUpdated);

        this.onFirstLoad = () => this.setState({ firstLoad: false });
        this.dataSource.firstLoad$.onValue(this.onFirstLoad);

        this.subscribers = subscribeEvents(this.setDialogHeight);

        this.setDialogHeight();
    }

    componentWillUnmount() {
        this.dataSource.isLoading$.offValue(this.setLoadingFlag);
        this.dataSource.data$.offValue(this.onRowsUpdated);
        this.dataSource.firstLoad$.offValue(this.onFirstLoad);

        this.subscribers.forEach(subscriber => {
            subscriber.unsubscribe();
        });
        this.subscribers = null;
    }

    onShowBubble(attribute) {
        cachedLoader(attribute).then(details => {
            attribute.details = details;
            this.list.forceUpdate();
        });
    }

    onDropdownToggle() {
        let displayDropdown = this.state.displayDropdown;

        this.setState({ displayDropdown: !displayDropdown });

        if (!displayDropdown) {
            invariant(this.dataSource, 'Data source was not created.');

            this.dataSource.load();
            this.setDialogHeight();
        }
    }

    onSelect(attribute) {
        this.onDropdownToggle();
        this.props.onSelect(fromJS(attribute));
    }

    onSearch(searchString) {
        this.dataSource.search({ searchString });
    }

    onScroll() {
        const node = ReactDOM.findDOMNode(this.list);
        node.dispatchEvent(new CustomEvent('goodstrap.scrolled', { bubbles: true }));
    }

    setDialogHeight() {
        const { button } = this.state;
        if (!button) {
            return;
        }

        const dialogHeight = getDialogHeight(button.getBoundingClientRect().top);
        this.setState({ dialogHeight });
    }

    getListHeight() {
        return this.state.dialogHeight - SEARCHBOX_HEIGHT - PADDING;
    }

    getLoadingHeight() {
        return this.state.dialogHeight - PADDING;
    }

    getDropdownClasses() {
        return classNames(
            'overlay',
            'gd-dialog',
            'gd-dropdown',
            'adi-filter-picker',
            'adi-attr-filter-picker'
        );
    }

    renderSelect() {
        if (!this.state.firstLoad) {
            return (
                <SearchField
                    value={this.state.searchString}
                    onChange={this.onSearch}
                    placeholder={this.props.intl.formatMessage({ id: 'search' })}
                    small
                    autofocus
                />
            );
        }

        return false;
    }

    renderLoading(height) {
        return <LoadingList height={height} />;
    }

    renderNoResults(height) {
        return <NoResultsList height={height} />;
    }

    renderList() {
        if (this.state.firstLoad) {
            return this.renderLoading(this.getLoadingHeight());
        }

        const listHeight = this.getListHeight();

        if (this.state.isLoading) {
            return this.renderLoading(listHeight + CONTENT_PADDING);
        }

        if (!this.dataSource.rowsCount) {
            return this.renderNoResults(listHeight + CONTENT_PADDING);
        }

        return (
            <List
                ref={list => { this.list = list; }}
                dataSource={this.dataSource}
                onSelect={this.onSelect}
                width={LIST_WIDTH}
                height={listHeight}
                itemHeight={ITEM_HEIGHT}
                rowItem={<MetricAttributeListItem onShowBubble={this.onShowBubble} />}
                onScrollStart={this.onScroll}
            />
        );
    }

    renderContent() {
        return (
            <div className="gd-list">
                <div className="gd-list-root">
                    {this.renderSelect()}
                    {this.renderList()}
                </div>
            </div>
        );
    }

    renderDropdown() {
        return (
            <ReactOverlay
                onClose={this.onDropdownToggle}
                alignTo=".s-add_attribute_filter.button"
                alignPoints={DROPDOWN_ALIGMENTS}
                closeOnOutsideClick
                closeOnParentScroll
                closeOnMouseDrag
            >
                <div className={this.getDropdownClasses()}>
                    {this.renderContent()}
                </div>
            </ReactOverlay>);
    }

    render() {
        let buttonText = this.props.intl.formatMessage({ id: 'dashboard.bucket.add_attribute_filter' });
        return (
            <span>
                <Button
                    ref={b => { this.state.button = ReactDOM.findDOMNode(b); }}
                    className="s-metric-attribute-filter-button button-link icon-plus button-dropdown icon-right icon-navigateup"
                    title={buttonText}
                    value={buttonText}
                    onClick={this.onDropdownToggle}
                />
                {this.state.displayDropdown ? this.renderDropdown() : false}
            </span>
        );
    }
}

export default injectIntl(MetricAttributeFilter);

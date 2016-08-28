import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { injectIntl } from 'react-intl';
import { List, Map } from 'immutable';
import { pick, bindAll, debounce } from 'lodash';
import pureRender from 'pure-render-decorator';

import Button from 'Button/ReactButton';
import FilterDropdown from '../shared/FilterDropdown';
import ReactAttributeFilter from './ReactAttributeFilter';

import { subscribeEvents, getDialogHeight } from '../../utils/dropdown';

export const MAX_SELECTION_SIZE = 500;
const INITIAL_CHUNK_SIZE = 520; // 20 on top of MAX_SELECTION_SIZE so that there are always enough items for string sample
const DEBOUNCE = 100;

const BUTTONS_HEIGHT = 49;
const PADDING = 12;

@pureRender
export class AttributeFilter extends Component {
    static propTypes = {
        filter: PropTypes.object,
        autoOpen: PropTypes.bool,
        elements: PropTypes.object,
        onLoadAttributeElements: PropTypes.func.isRequired,
        onApply: PropTypes.func,
        intl: PropTypes.shape({ formatMessage: PropTypes.func })
    };

    static defaultProps = {
        autoOpen: false,
        elements: Map({ items: [] })
    };

    constructor(props) {
        super(props);

        this.state = {
            displayDropdown: false,
            searchString: '',
            selectedElements: List(),
            isInverted: true,
            button: null,
            dialogHeight: 0
        };

        this.debouncedOnRangeChange = debounce((...args) => this.props.onLoadAttributeElements(...args), DEBOUNCE);

        bindAll(this, ['onSelect', 'onSearch', 'onOpen', 'onClose', 'onApply', 'setDialogHeight']);
    }

    componentDidMount() {
        if (this.props.autoOpen) {
            this.onOpen();
        }

        this.subscribers = subscribeEvents(this.setDialogHeight);

        this.setDialogHeight();
    }

    componentWillUnmount() {
        this.subscribers.forEach(subscriber => {
            subscriber.unsubscribe();
        });
        this.subscribers = null;
    }

    onSelect(selectedElements, isInverted) {
        this.setState({ selectedElements: List(selectedElements), isInverted });
    }

    onSearch(searchString) {
        this.setState({ searchString });
        this.props.onLoadAttributeElements(searchString, 0, INITIAL_CHUNK_SIZE);
    }

    onOpen() {
        let filter = this.props.filter;

        this.setState({
            displayDropdown: true,
            searchString: '',
            selectedElements: filter.get('selectedElements') || List(),
            isInverted: filter.get('isInverted')
        });

        this.setDialogHeight();
        this.props.onLoadAttributeElements('', 0, INITIAL_CHUNK_SIZE);
    }

    onClose() {
        this.setState({ displayDropdown: false });
    }

    onApply() {
        let state = this.state,
            elements = this.props.elements;

        this.props.onApply({
            allElements: elements.get('initialItems'),
            selectedElements: state.selectedElements,
            isInverted: state.isInverted,
            totalElementsCount: elements.get('total')
        });

        this.onClose();
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
        return this.state.dialogHeight - BUTTONS_HEIGHT - PADDING;
    }

    disabledApply() {
        return this.emptySelection() || this.selectionUnchanged();
    }

    emptySelection() {
        return this.noItemsSelected() || this.allItemsUnselected();
    }

    noItemsSelected() {
        return this.isEmptySelection() && this.isPositiveSelection();
    }

    allItemsUnselected() {
        let { isInverted, selectedElements } = this.state;
        return isInverted && (this.props.elements.get('total') === selectedElements.size);
    }

    isEmptySelection() {
        return !this.state.selectedElements || !this.state.selectedElements.size;
    }

    isPositiveSelection() {
        return !this.state.isInverted;
    }

    selectionUnchanged() {
        let filter = this.props.filter,
            { selectedElements, isInverted } = this.state;

        return !filter || filter.selectionEquals(selectedElements, isInverted);
    }

    renderButtons() {
        let t = this.props.intl.formatMessage,
            cancelText = t({ id: 'cancel' }), applyText = t({ id: 'apply' });

        return (
            <div className="filter-picker-buttons">
                <Button
                    className="button-secondary button-small cancel-button"
                    onClick={this.onClose}
                    value={cancelText}
                    text={cancelText}
                />
                <Button
                    className="button-action button-small s-apply"
                    onClick={this.onApply}
                    value={applyText}
                    text={applyText}
                    disabled={this.disabledApply()}
                />
            </div>
        );
    }

    render() {
        let props = this.props,
            { selectedElements, isInverted, searchString, dialogHeight } = this.state,
            elements = props.elements,
            dropdownProps = pick(props, 'filter', 'className'),
            dropdownHandlers = pick(this, 'onOpen', 'onClose');

        return (
            <FilterDropdown
                getButtonRef={b => { this.state.button = ReactDOM.findDOMNode(b); }}
                {...dropdownProps}
                {...dropdownHandlers}
                isOpen={this.state.displayDropdown}
                dialogClass="attr"
                height={dialogHeight}
            >
                <div className="gd-list react-list-root filter-list">
                    <ReactAttributeFilter
                        items={elements.get('items')}
                        itemsCount={elements.get('total')}
                        filteredItemsCount={Math.min(elements.get('total'), elements.get('filteredTotal'))}
                        selection={selectedElements.toArray()}
                        isInverted={isInverted}
                        isLoading={elements.get('isLoading')}
                        searchString={searchString}
                        showSearchField={!!elements.get('total')}
                        maxSelectionSize={MAX_SELECTION_SIZE}
                        onSelect={this.onSelect}
                        onSearch={this.onSearch}
                        onRangeChange={this.debouncedOnRangeChange}
                        height={this.getListHeight()}
                    />
                </div>
                {this.renderButtons()}
            </FilterDropdown>
        );
    }
}

export default injectIntl(AttributeFilter);

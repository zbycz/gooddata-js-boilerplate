import React, { Component, PropTypes } from 'react';
import { bindAll, uniqueId } from 'lodash';
import pureRender from 'pure-render-decorator';
import classNames from 'classnames';

import ReactOverlay from 'core/ReactOverlay';
import FilterLabel from './FilterLabel';

import { getCssClass } from '../../utils/css_class';
import { DROPDOWN_ALIGMENTS } from '../../utils/dropdown';

@pureRender
export default class FilterDropdown extends Component {
    static propTypes = {
        filter: PropTypes.object,
        disabledApply: PropTypes.bool,
        onOpen: PropTypes.func,
        onClose: PropTypes.func,
        getButtonRef: PropTypes.func,
        isOpen: PropTypes.bool,
        dialogClass: PropTypes.string,
        className: PropTypes.string,
        children: React.PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        intl: PropTypes.shape({ formatMessage: PropTypes.func })
    };

    static defaultProps = {
        getButtonRef: () => {}
    }

    constructor(props) {
        super(props);

        this.state = { dialogId: uniqueId('filter_') };

        bindAll(this, ['onToggleDropdown']);
    }

    onToggleDropdown() {
        let props = this.props,
            handler = props[!props.isOpen ? 'onOpen' : 'onClose'];

        if (handler) {
            handler();
        }
    }

    getButtonClasses() {
        let isOpen = this.props.isOpen;
        return classNames(
            ['icon-right', 'dropdown-button', 'toggle-menu', 'adi-filter-button',
                's-filter-button', `adi-${this.props.dialogClass}-filter-button`,
                'button', 'button-dropdown', 'icon-right'],
            {
                'icon-navigateup': isOpen,
                'icon-navigatedown': !isOpen,
                'is-active': isOpen
            },
            this.props.className
        );
    }

    getAttributeClass() {
        return getCssClass(this.props.filter.getIn(['attribute', 'identifier']), 's-id-');
    }

    getFilterClasses() {
        return classNames('s-attr-filter', this.getAttributeClass());
    }

    getDialogClasses() {
        return classNames(
            ['overlay', 'gd-dialog', 'gd-dropdown', 'adi-filter-picker', 's-filter-picker'],
            `adi-${this.props.dialogClass}-filter-picker`
        );
    }

    renderDropdown() {
        return (
            <ReactOverlay
                alignTo={`#${this.state.dialogId}`}
                alignPoints={DROPDOWN_ALIGMENTS}
                closeOnOutsideClick
                closeOnParentScroll
                closeOnMouseDrag
                onClose={this.props.onClose}
            >
                <div className={this.getDialogClasses()}>
                    {this.props.children}
                </div>
            </ReactOverlay>);
    }

    render() {
        // using plain button, because ReactButton does not support child elements
        return (
            <span className={this.getFilterClasses()}>
                <div
                    ref={this.props.getButtonRef}
                    id={this.state.dialogId}
                    type="button"
                    tabIndex="-1"
                    className={this.getButtonClasses()}
                    onClick={this.onToggleDropdown}
                >
                    <span className="button-text">
                        <FilterLabel filter={this.props.filter} />
                    </span>
                </div>
                {this.props.isOpen && this.renderDropdown()}
            </span>
        );
    }
}

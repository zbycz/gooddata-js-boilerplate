import React, { Component, PropTypes } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Map, fromJS } from 'immutable';
import { bindAll, padStart, pick } from 'lodash';
import pureRender from 'pure-render-decorator';

import classNames from 'classnames';

import Button from 'Button/ReactButton';
import DatePicker from 'Datepicker/ReactDatepicker';

import FilterDropdown from '../shared/FilterDropdown';
import { GRANULARITY } from '../../models/granularity';
import DateDataSetsDropdown from '../buckets/categories/DateDataSetsDropdown';
import { decoratedPresetItem, PRESETS, PRESETS_BY_NAME } from '../../models/preset_item';

// do not use toISOString or UTC based methods here because they could shift date +-day and send different date then was chosen
const getIsoDate = date => [
    date.getFullYear(), padStart(date.getMonth() + 1, 2, '0'), padStart(date.getDate(), 2, '0')
].join('-');

const DATE_DATASETS_DROPDOWN_ITEM_HEIGHT = 23;
const DATE_DATASETS_DROPDOWN_WIDTH = 200;

@pureRender
export class DateFilter extends Component {
    static propTypes = {
        filter: PropTypes.object.isRequired,
        dateDataSets: PropTypes.object.isRequired,
        timezoneOffset: PropTypes.number.isRequired,
        isSelectDisabled: PropTypes.bool,
        onApply: PropTypes.func,
        className: PropTypes.string,
        intl: PropTypes.shape({ formatMessage: PropTypes.func }),
        defaultDialogHeight: PropTypes.number
    };

    static defaultProps = {
        dateDataSets: Map({ items: [] }),
        timezoneOffset: 0,
        defaultDialogHeight: 0
    };

    constructor(props) {
        super(props);

        this.state = {
            displayDropdown: false,
            activeTab: 'presets',
            interval: null,
            start: null,
            end: null
        };

        bindAll(this, [
            'onSelectDateDataSet', 'onSelectPreset', 'onSelectInterval', 'onSetStart', 'onSetEnd',
            'onTabChange', 'onOpen', 'onClose'
        ]);
    }

    onSelectDateDataSet({ id }) {
        const selected = this.props.dateDataSets.get('items')
            .find(dateDataSet => dateDataSet.get('identifier') === id);

        this.props.onApply({ dateDataSet: selected });
    }

    onSelectPreset(preset) {
        this.setState({
            interval: preset,
            start: this.getPeriodStart(preset),
            end: this.getPeriodEnd(preset)
        });

        this.props.onApply({ interval: preset.get('original') });

        this.onClose();
    }

    onSelectInterval() {
        let { start, end } = this.state,
            interval = decoratedPresetItem(fromJS({
                interval: [getIsoDate(start), getIsoDate(end)],
                granularity: GRANULARITY.date
            }));

        this.onSelectPreset(interval);
    }

    onSetStart(start) {
        if (this.setIsValidDate(start, 'Start')) {
            this.setState({ start, end: new Date(Math.max(start, this.state.end)) });
        }
    }

    onSetEnd(end) {
        if (this.setIsValidDate(end, 'End')) {
            this.setState({ start: new Date(Math.min(end, this.state.start)), end });
        }
    }

    onTabChange(activeTab) {
        this.setState({ activeTab });
    }

    onOpen() {
        let filter = this.props.filter,
            interval = filter.get('interval'),
            last30Days = PRESETS_BY_NAME.get('last_30_days'),
            start = this.getPeriodStart(interval) || this.getPeriodStart(last30Days),
            end = this.getPeriodEnd(interval) || this.getPeriodEnd(last30Days);

        this.setState({
            displayDropdown: true,
            activeTab: interval && interval.get('isStatic') ? 'range' : 'presets',
            interval,
            start,
            end
        });
    }

    onClose() {
        this.setState({ displayDropdown: false });
    }

    setIsValidDate(date, name) {
        const isValid = date !== null;
        this.setState({ [`isValid${name}`]: isValid });

        return isValid;
    }

    getPeriodDate(interval, name) {
        const pickerInterval = interval.getPickerInterval(this.props.timezoneOffset);
        return pickerInterval ? pickerInterval.get(name) : null;
    }

    getPeriodStart(interval) {
        return this.getPeriodDate(interval, 'start');
    }

    getPeriodEnd(interval) {
        return this.getPeriodDate(interval, 'end');
    }

    getTabClasses(name) {
        return classNames(
            ['gd-tab', `s-tab-${name}`],
            { 'is-active': this.state.activeTab === name }
        );
    }

    getContentClasses(name) {
        return classNames(
            `adi-tab-${name}`,
            { 'invisible': this.state.activeTab !== name }
        );
    }

    getPresetClass(preset) {
        return classNames(
            'mouseoverTrigger',
            'filter-picker-text',
            preset.get('seleniumClass')
        );
    }

    disabledApply() {
        const { start, end, isValidStart, isValidEnd } = this.state;
        return !(start && end && isValidStart && isValidEnd);
    }

    renderSelect() {
        const { dateDataSets, filter, defaultDialogHeight } = this.props;
        const activeDateDataSet = filter.get('dateDataSet');

        return (
            <div className="adi-date-dataset-select">
                <span className="select">
                    <DateDataSetsDropdown
                        disabled={this.props.isSelectDisabled}
                        className="s-filter-date-date-dataset-switch adi-date-dataset-select-dropdown"
                        unavailableCount={dateDataSets.get('unavailable')}
                        dateDataSets={dateDataSets.get('items')}
                        activeDateDataSet={activeDateDataSet}
                        onDateDataSetChange={this.onSelectDateDataSet}
                        width={DATE_DATASETS_DROPDOWN_WIDTH}
                        itemHeight={DATE_DATASETS_DROPDOWN_ITEM_HEIGHT}
                        defaultDialogHeight={defaultDialogHeight}
                    />
                    <FormattedMessage id="filter.date.date-dataset.is" />
                </span>
            </div>
        );
    }

    renderTab(tab) {
        return (
            <div
                className={this.getTabClasses(tab)}
                onClick={() => this.onTabChange(tab)}
            >
                <FormattedMessage id={`filter.date.${tab}`} />
            </div>
        );
    }

    renderTabs() {
        return (
            <div className="gd-tabs adi-date-filter-tabs small is-condensed">
                {this.renderTab('presets')}
                {this.renderTab('range')}
            </div>
        );
    }

    renderPresets() {
        return (
            <section className={this.getContentClasses('presets')}>
                {PRESETS.map((preset, idx) => {
                    if (preset.get('header')) {
                        return <div key={idx} className="filter-picker-header">{preset.get('header')}</div>;
                    }
                    const onClick = this.onSelectPreset.bind(this, preset);
                    return (
                        <div
                            key={idx}
                            className={this.getPresetClass(preset)}
                            onClick={onClick}
                        >
                            {preset.getTitle()}
                        </div>
                    );
                }).toJS()}
            </section>
        );
    }

    renderDateRange() {
        let t = this.props.intl.formatMessage,
            cancelText = t({ id: 'cancel' }), applyText = t({ id: 'apply' }),
            { start, end } = this.state;

        return (
            <section className={this.getContentClasses('range')}>
                <FormattedMessage id="filter.date.interval.between" /><br />
                <DatePicker
                    size="small"
                    className="adi-date-input-from s-interval-from"
                    date={start}
                    onChange={this.onSetStart}
                />
                <FormattedMessage id="filter.date.interval.and" />
                <DatePicker
                    size="small"
                    className="adi-date-input-to s-interval-to"
                    date={end}
                    onChange={this.onSetEnd}
                />
                <footer>
                    <Button
                        className="button-secondary button-small s-date-range-cancel"
                        onClick={this.onClose}
                        value={cancelText}
                        text={cancelText}
                    />
                    <Button
                        className="button-action button-small s-date-range-apply"
                        onClick={this.onSelectInterval}
                        value={applyText}
                        text={applyText}
                        disabled={this.disabledApply()}
                    />
                </footer>
            </section>
        );
    }

    render() {
        const dropdownProps = pick(this.props, 'filter', 'className');
        const dropdownHandlers = pick(this, 'onOpen', 'onClose');

        return (
            <FilterDropdown
                {...dropdownProps}
                {...dropdownHandlers}
                isOpen={this.state.displayDropdown}
                dialogClass="date"
            >
                {this.renderSelect()}
                {this.renderTabs()}
                {this.renderPresets()}
                {this.renderDateRange()}
            </FilterDropdown>
        );
    }
}

export default injectIntl(DateFilter);

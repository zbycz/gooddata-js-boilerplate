import React, { Component, PropTypes } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import cx from 'classnames';

import Dropdown, { DropdownButton, DropdownBody } from 'goodstrap/packages/Dropdown/ReactDropdown';
import createDataSource from 'goodstrap/packages/data/DateDataSetsDataSource';
import List from 'goodstrap/packages/List/ReactList';
import DateDataSetListItem from 'goodstrap/packages/List/ReactDateDataSetsListItem';
import {
    getDateConfigurationDropdownHeight,
    subscribeEvents,
    DATE_DROPDOWN_ALIGMENTS
} from '../../../utils/dropdown';

export class DateDataSetsDropdown extends Component {

    static propTypes = {
        dateDataSets: PropTypes.object.isRequired,
        unavailableCount: PropTypes.number.isRequired,
        activeDateDataSet: PropTypes.object.isRequired,
        onDateDataSetChange: PropTypes.func.isRequired,
        width: PropTypes.number,
        itemHeight: PropTypes.number.isRequired,
        disabled: PropTypes.bool,
        className: PropTypes.string,
        defaultDialogHeight: PropTypes.number
    };

    static defaultProps = {
        disabled: false,
        className: 's-date-dataset-switch',
        defaultDialogHeight: 0
    };

    constructor(props) {
        super(props);

        this.onOpenStateChanged = this.onOpenStateChanged.bind(this);
        this.getDialogHeight = this.getDialogHeight.bind(this);

        this.state = {
            opened: false
        };
    }

    componentDidMount() {
        this.subscribers = subscribeEvents(this.setDialogHeight);
    }

    componentWillUnmount() {
        this.subscribers.forEach(subscriber => {
            subscriber.unsubscribe();
        });
        this.subscribers = null;
    }

    onOpenStateChanged(opened) {
        this.setState({ opened });
    }

    getDialogHeight() {
        const button = this.button;
        if (!button || !this.dataSource) {
            return this.props.defaultDialogHeight;
        }

        const { itemHeight, unavailableCount } = this.props;

        const dropdownBodyHeight = this.dataSource.rowsCount * itemHeight;
        const dialogHeight = getDateConfigurationDropdownHeight(
            button.getBoundingClientRect().top,
            button.getBoundingClientRect().height,
            dropdownBodyHeight,
            unavailableCount > 0
        );
        return dialogHeight;
    }

    renderDropdownButton() {
        const { activeDateDataSet, disabled } = this.props;
        const { opened } = this.state;
        const className = cx(
            's-date-dataset-button',
            opened ? 's-expanded' : 's-collapsed'
        );

        return (
            <div ref={b => (this.button = b)}>
                <DropdownButton
                    className={className}
                    value={activeDateDataSet.get('attributeTitle')}
                    disabled={disabled}
                />
            </div>
        );
    }

    renderUnavailable() {
        const { unavailableCount } = this.props;
        if (!unavailableCount) {
            return null;
        }

        return (
            <div className="gd-list-footer">
                <FormattedMessage
                    id="date.date-dataset.unrelated_hidden"
                    values={{ count: unavailableCount }}
                />
            </div>
        );
    }

    render() {
        const {
            activeDateDataSet,
            onDateDataSetChange,
            dateDataSets,
            width,
            itemHeight,
            disabled,
            className
        } = this.props;

        const convertedDateDataSets = dateDataSets.map(d => ({
            id: d.get('identifier'),
            title: d.get('attributeTitle'),
            relevance: d.get('relevance')
        }));

        this.dataSource = createDataSource(convertedDateDataSets.toArray());
        return (
            <Dropdown
                disabled={disabled}
                className={className}
                button={this.renderDropdownButton()}
                onOpenStateChanged={this.onOpenStateChanged}
                alignPoints={DATE_DROPDOWN_ALIGMENTS}
                closeOnParentScroll
                closeOnMouseDrag
                body={
                    <DropdownBody
                        className="adi-date-datasets-list"
                        List={List}
                        dataSource={this.dataSource}
                        itemHeight={itemHeight}
                        height={this.getDialogHeight}
                        width={width}
                        rowItem={
                            <DateDataSetListItem
                                activeDateDataSetId={activeDateDataSet.get('identifier')}
                                onDateDataSetChange={onDateDataSetChange}
                            />
                        }
                        Footer={this.renderUnavailable()}
                    />
                }
            />
        );
    }
}

export default injectIntl(DateDataSetsDropdown);

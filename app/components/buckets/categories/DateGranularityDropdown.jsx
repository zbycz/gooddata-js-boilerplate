import React, { Component, PropTypes } from 'react';
import cx from 'classnames';

import Dropdown, { DropdownButton, DropdownBody } from 'goodstrap/packages/Dropdown/ReactDropdown';
import DateGranularityListItem from './DateGranularityListItem';
import List from 'goodstrap/packages/List/ReactList';
import {
    getDateConfigurationDropdownHeight,
    subscribeEvents,
    DATE_DROPDOWN_ALIGMENTS
} from '../../../utils/dropdown';

const DateGranularityItem = props => (
    props.item ? <DateGranularityListItem {...props} /> : null
);

DateGranularityItem.propTypes = { item: PropTypes.object };

export default class DateGranularityDropdown extends Component {

    static propTypes = {
        granularities: PropTypes.object.isRequired,
        activeGranularity: PropTypes.object.isRequired,
        onGranularityChange: PropTypes.func.isRequired,
        itemHeight: PropTypes.number.isRequired,
        width: PropTypes.number,
        defaultDialogHeight: PropTypes.number
    };

    static defaultProps = {
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
        if (!button) {
            return this.props.defaultDialogHeight;
        }
        const { granularities, itemHeight } = this.props;

        const dialogHeight = getDateConfigurationDropdownHeight(
            button.getBoundingClientRect().top,
            button.getBoundingClientRect().height,
            granularities.size * itemHeight
        );
        return dialogHeight;
    }

    renderDropdownButton() {
        const { activeGranularity } = this.props;
        const { opened } = this.state;
        const className = cx(
            's-date-granularity-button',
            opened ? 's-expanded' : 's-collapsed'
        );

        return (
            <div ref={b => (this.button = b)}>
                <DropdownButton
                    className={className}
                    value={activeGranularity.get('label')}
                />
            </div>
        );
    }

    render() {
        const {
            itemHeight,
            width,
            onGranularityChange,
            activeGranularity,
            granularities
        } = this.props;

        const dataSource = {
            rowsCount: granularities.size,
            getObjectAt: rowIndex => granularities.get(rowIndex)
        };

        return (
            <Dropdown
                className="s-date-granularity-switch"
                button={this.renderDropdownButton()}
                onOpenStateChanged={this.onOpenStateChanged}
                alignPoints={DATE_DROPDOWN_ALIGMENTS}
                closeOnParentScroll
                closeOnMouseDrag
                body={
                    <DropdownBody
                        itemHeight={itemHeight}
                        width={width}
                        List={List}
                        height={this.getDialogHeight}
                        dataSource={dataSource}
                        rowItem={
                            <DateGranularityItem
                                activeGranularity={activeGranularity}
                                onGranularityChange={onGranularityChange}
                            />
                        }
                    />
                }
            />
        );
    }
}

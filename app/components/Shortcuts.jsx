import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import ShortcutPanel from './shortcuts/ShortcutPanel';
import ShortcutDropTarget from './shortcuts/ShortcutDropTarget';
import ShortcutSingleAttribute from './shortcuts/ShortcutSingleAttribute';
import ShortcutSingleMetric from './shortcuts/ShortcutSingleMetric';
import ShortcutMetricOverTime from './shortcuts/ShortcutMetricOverTime';
import shortcutsSelector from '../selectors/shortcuts_selector';
import * as Actions from '../actions/shortcuts_actions';
import { FACT, METRIC } from '../constants/CatalogueItemTypes';

export class Shortcuts extends Component {
    static propTypes = {
        activeDragItem: PropTypes.object,
        applyAttributeShortcut: PropTypes.func.isRequired,
        applyMetricShortcut: PropTypes.func.isRequired,
        applyMetricOverTimeShortcut: PropTypes.func.isRequired,
        dropCatalogueItem: PropTypes.func.isRequired,
        displayBlock: PropTypes.bool.isRequired,
        displayAttribute: PropTypes.bool.isRequired,
        displayMetric: PropTypes.bool.isRequired,
        displayMetricOverTime: PropTypes.bool.isRequired,
        isMetricOverTimeDisabled: PropTypes.bool.isRequired,
        loadShortcutDateDataSets: PropTypes.func.isRequired
    };

    componentWillMount() {
        if (this.isDraggedMeasure(this.props)) {
            this.props.loadShortcutDateDataSets();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.activeDragItem !== this.props.activeDragItem && this.isDraggedMeasure(nextProps)) {
            this.props.loadShortcutDateDataSets();
        }
    }

    getAttributeShortcut(displayAttribute, activeDragItem) {
        const title = activeDragItem && activeDragItem.get('title');
        const { applyAttributeShortcut } = this.props;

        return displayAttribute && (
            <ShortcutPanel>
                <ShortcutDropTarget onDrop={applyAttributeShortcut}>
                    <ShortcutSingleAttribute title={title} />
                </ShortcutDropTarget>
            </ShortcutPanel>
        );
    }

    getSingleMetricShortcut(displayMetric, title, itemType) {
        const { applyMetricShortcut } = this.props;

        return displayMetric && (
            <ShortcutDropTarget onDrop={applyMetricShortcut}>
                <ShortcutSingleMetric title={title} itemType={itemType} />
            </ShortcutDropTarget>
        );
    }

    getMetricOverTimeShortcut(displayMetricOverTime, title, itemType) {
        const { dropCatalogueItem, isMetricOverTimeDisabled } = this.props;

        return displayMetricOverTime && (
            <ShortcutDropTarget isDisabled={isMetricOverTimeDisabled} onDrop={dropCatalogueItem}>
                <ShortcutMetricOverTime title={title} itemType={itemType} />
            </ShortcutDropTarget>
        );
    }

    getMetricShortcuts(displayMetric, displayMetricOverTime, activeDragItem) {
        const title = activeDragItem && activeDragItem.get('title');
        const itemType = activeDragItem && activeDragItem.get('type');

        const shouldDisplay = displayMetric || displayMetricOverTime;

        return shouldDisplay && (
            <ShortcutPanel>
                {this.getSingleMetricShortcut(displayMetric, title, itemType)}
                {this.getMetricOverTimeShortcut(displayMetricOverTime, title, itemType)}
            </ShortcutPanel>
        );
    }

    isDraggedMeasure(props) {
        if (!props.activeDragItem) {
            return false;
        }

        const type = props.activeDragItem.get('type');

        return type === METRIC || type === FACT;
    }

    render() {
        const { activeDragItem, displayBlock, displayAttribute, displayMetric, displayMetricOverTime } = this.props;

        return displayBlock && (
            <div className="adi-shortcuts-area">
                {this.getAttributeShortcut(displayAttribute, activeDragItem)}
                {this.getMetricShortcuts(displayMetric, displayMetricOverTime, activeDragItem)}
            </div>
        );
    }
}

export default connect(shortcutsSelector, Actions)(Shortcuts);

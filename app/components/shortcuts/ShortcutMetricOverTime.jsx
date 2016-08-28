import React, { Component, PropTypes } from 'react';
import Shortcut from './Shortcut';
import ShortcutTitle from './ShortcutTitle';
import { connect } from 'react-redux';

import shortcutMetricOverTimeSelector from '../../selectors/shortcut_metric_over_time_selector';

export class ShortcutMetricOverTime extends Component {
    static propTypes = {
        itemType: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        availableDateDataSets: PropTypes.object.isRequired,
        areDateDataSetsLoaded: PropTypes.bool
    };

    static defaultProps = {
        areDateDataSetsLoaded: false
    };

    renderComputing() {
        const { areDateDataSetsLoaded } = this.props;
        if (!areDateDataSetsLoaded) {
            return (
                <div className="adi-shortcut-inner">
                    <div className="adi-shortcut-type adi-shortcut-computing s-loading" />
                    <ShortcutTitle translationKey="shortcut.computing_recommendation" />
                </div>
            );
        }
        return null;
    }

    renderCantBeTrended() {
        const { areDateDataSetsLoaded, availableDateDataSets } = this.props;
        if (areDateDataSetsLoaded && !availableDateDataSets.count()) {
            return (
                <div className="adi-shortcut-inner">
                    <div className="adi-shortcut-type adi-shortcut-info s-cant-be-trended" />
                    <ShortcutTitle translationKey="shortcut.measure_cant_be_trended" />
                </div>
            );
        }
        return null;
    }

    renderShortcutReady() {
        const { areDateDataSetsLoaded, availableDateDataSets, title, itemType } = this.props;
        if (areDateDataSetsLoaded && availableDateDataSets.count()) {
            return (
                <div className="adi-shortcut-inner">
                    <div className="adi-shortcut-metric-quarters adi-shortcut-type" />
                    <ShortcutTitle
                        translationKey="shortcut.metric_over_time"
                        title={title}
                        itemType={itemType}
                    />
                </div>
            );
        }
        return null;
    }

    render() {
        return (
            <Shortcut secondary>
                <div className="s-recommendation-metric-canvas s-recommendation-metric-over-time-canvas">
                    {this.renderComputing()}
                    {this.renderCantBeTrended()}
                    {this.renderShortcutReady()}
                </div>
            </Shortcut>
        );
    }
}

export default connect(shortcutMetricOverTimeSelector)(ShortcutMetricOverTime);

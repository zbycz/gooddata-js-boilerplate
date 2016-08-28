import React, { Component, PropTypes } from 'react';
import Shortcut from './Shortcut';
import ShortcutTitle from './ShortcutTitle';

export default class ShortcutSingleMetric extends Component {
    static propTypes = {
        itemType: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired
    };

    render() {
        return (
            <Shortcut primary>
                <div className="adi-shortcut-inner s-recommendation-metric-canvas">
                    <div className="adi-shortcut-bar-metric adi-shortcut-type" />
                    <ShortcutTitle
                        translationKey="shortcut.single_metric"
                        title={this.props.title}
                        itemType={this.props.itemType}
                    />
                </div>
            </Shortcut>
        );
    }
}

import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

export default class ShortcutPanel extends Component {
    static propTypes = {
        children: PropTypes.node.isRequired
    };

    render() {
        return (
            <div className="adi-shortcuts-panel">
                <div className="adi-shortcut-title"><FormattedMessage id="dashboard.recommendation.recommended_steps" /></div>
                {this.props.children}
            </div>
        );
    }
}

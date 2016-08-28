import React, { Component, PropTypes } from 'react';
import Shortcut from './Shortcut';
import ShortcutTitle from './ShortcutTitle';

export default class ShortcutSingleAttribute extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired
    };

    render() {
        return (
            <Shortcut primary>
                <div className="adi-shortcut-inner s-recommendation-attribute-canvas">
                    <div className="adi-shortcut-attribute-table adi-shortcut-type" />
                    <ShortcutTitle
                        translationKey="shortcut.single_attribute"
                        title={this.props.title}
                    />
                </div>
            </Shortcut>
        );
    }
}

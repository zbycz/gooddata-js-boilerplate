import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';


export default class Trash extends Component {

    static propTypes = {
        isOver: PropTypes.bool
    };

    render() {
        const { isOver } = this.props;
        const classes = classNames(
            'adi-trash',
            's-trash',
            'adi-shortcut',
            {
                'adi-droppable-hover': isOver
            }
        );

        return (
            <div className={classes}>
                <div className="adi-shortcut-inner">
                    <div className="adi-trash-inner">
                        <p><FormattedMessage id="dashboard.trash.hint" /></p>
                    </div>
                </div>
            </div>
        );
    }
}

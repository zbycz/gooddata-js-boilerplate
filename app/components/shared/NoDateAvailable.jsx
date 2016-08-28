import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

export default class NoDateAvailable extends Component {
    static propTypes = {
        message: PropTypes.string.isRequired,
        className: PropTypes.string
    };

    render() {
        const classes = classNames(this.props.className, [
            'no-date-available',
            'adi-filter-button',
            'adi-date-filter-button',
            'button',
            's-no-date-available'
        ]);

        return (
            <div className={classes}>
                <span className="button-text s-explanation">
                    <FormattedMessage id={this.props.message} />
                </span>
            </div>
        );
    }
}

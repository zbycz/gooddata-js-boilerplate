import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

export default class CatalogueEmpty extends Component {
    static propTypes = {
        search: PropTypes.string.isRequired
    };

    render() {
        return (
            <div className="adi-no-items">
                <span className="s-not-matching-message">
                    <FormattedMessage id="catalogue.no_data_matching" /><br />
                    "{this.props.search}"
                </span>
            </div>
        );
    }
}

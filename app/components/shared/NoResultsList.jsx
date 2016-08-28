import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

const PADDING = 30;

export default class NoResultsMatched extends React.Component {
    static propTypes = {
        height: PropTypes.number
    }

    static defaultProps = {
        height: 300
    }

    render() {
        return (
            <div className="gd-list-noResults" style={{ height: this.props.height - PADDING }}>
                <FormattedMessage id="no_results_matched" />
            </div>
        );
    }
}

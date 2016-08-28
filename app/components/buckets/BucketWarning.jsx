import React, { Component, PropTypes } from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';


export default class BucketWarning extends Component {
    static propTypes = {
        keyName: PropTypes.string.isRequired,
        visualizationType: PropTypes.string.isRequired,
        canAddMoreItems: PropTypes.bool
    };
    static defaultProps = {
        canAddMoreItems: true
    };

    render() {
        const { keyName, canAddMoreItems, visualizationType } = this.props;

        if (keyName === 'metrics' && !canAddMoreItems) {
            switch (visualizationType) {
                case 'bar':
                case 'column':
                    return (
                        <div className="adi-stack-warn s-stack-warn">
                            <FormattedHTMLMessage id="dashboard.bucket.metric_stack_by_warning" />
                        </div>
                    );
                case 'line':
                    return (
                        <div className="adi-stack-warn s-stack-warn">
                            <FormattedHTMLMessage id="dashboard.bucket.metric_segment_by_warning" />
                        </div>
                    );
                default:
                    return null;
            }
        }

        if (keyName === 'stacks' && !canAddMoreItems) {
            switch (visualizationType) {
                case 'bar':
                case 'column':
                    return (
                        <div className="adi-stack-warn s-stack-warn">
                            <FormattedMessage id="dashboard.bucket.category_stack_by_warning" />
                        </div>
                    );
                case 'line':
                    return (
                        <div className="adi-stack-warn s-stack-warn">
                            <FormattedMessage id="dashboard.bucket.category_segment_by_warning" />
                        </div>
                    );
                default:
                    return null;
            }
        }

        return null;
    }
}

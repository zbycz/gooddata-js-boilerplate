import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import pureRender from 'pure-render-decorator';

@pureRender
export default class FactBubbleContent extends React.Component {
    static propTypes = {
        dataset: PropTypes.object
    };

    static defaultProps = {
        dataset: null
    };

    renderDataset() {
        if (!this.props.dataset) {
            return <FormattedMessage id="loading" />;
        }

        return <span className="s-dataset-name">{this.props.dataset.get('title')}</span>;
    }

    render() {
        return (
            <span>
                <h4><FormattedMessage id="dashboard.catalogue_item.dataset" /></h4>
                <p>{this.renderDataset()}</p>
            </span>
        );
    }
}

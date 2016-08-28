import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import pureRender from 'pure-render-decorator';

@pureRender
export default class MetricBubbleContent extends React.Component {
    static propTypes = {
        maql: PropTypes.object
    };

    static defaultProps = {
        maql: null
    };

    renderContent(props) {
        if (props.maql) {
            return props.maql.map((m, idx) => {
                let category = m.get('category');
                return category ?
                    <span key={idx} className={`${category} adi-maql-segment`}>{m.get('title')}</span> :
                    m.get('title');
            }).toJS();
        }

        return <FormattedMessage id="loading" />;
    }

    render() {
        return (
            <span>
                <h4><FormattedMessage id="dashboard.catalogue_item.defined_as" /></h4>
                <p className="adi-metric-maql">
                    {this.renderContent(this.props)}
                </p>
            </span>
        );
    }
}

import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import pureRender from 'pure-render-decorator';

import Bubble from 'Bubble/ReactBubble';
import BubbleHoverTrigger from 'Bubble/ReactBubbleHoverTrigger';

import AttributeBubbleContent from './../shared/AttributeBubbleContent.jsx';
import FactBubbleContent from './../shared/FactBubbleContent.jsx';
import MetricBubbleContent from './../shared/MetricBubbleContent.jsx';

@pureRender
export default class CatalogueDetailsBubble extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        offsetX: PropTypes.number,
        offsetY: PropTypes.number,
        onShowBubble: PropTypes.func,
        onHideBubble: PropTypes.func
    };

    static defaultProps = {
        offsetX: 200,
        offsetY: 10,
        onShowBubble: () => {},
        onHideBubble: () => {}
    };

    getItemDetails(prop) {
        let item = this.props.item.get('details');
        return item ? item.get(prop) : null;
    }

    getClasses() {
        const details = this.props.item.get('details');

        return classNames(
            'bubble-light',
            'adi-catalogue-item-details',
            's-catalogue-bubble',
            {
                's-catalogue-bubble-loaded': !!details,
                's-catalogue-bubble-loading': !details
            }
        );
    }

    renderContent() {
        let type = this.props.item.get('type');

        switch (type) {
            case 'metric':
                return <MetricBubbleContent maql={this.getItemDetails('metricMaql')} />;
            case 'attribute':
                return (
                    <AttributeBubbleContent
                        elements={this.getItemDetails('attrElements')}
                        totalElementsCount={this.getItemDetails('attrElementsTotalCount')}
                    />
                );
            case 'fact':
                return <FactBubbleContent dataset={this.getItemDetails('dataset')} />;
            case 'date':
                return false;
            default:
                throw new Error(`Invalid attribute item type: ${type}`);
        }
    }

    render() {
        let props = this.props;
        return (
            <BubbleHoverTrigger showDelay={0} hideDelay={0} eventsOnBubble={false}>
                <span
                    className="inlineBubbleHelp"
                    onMouseEnter={() => props.onShowBubble(props.item)}
                    onMouseLeave={() => props.onHideBubble(props.item)}
                />
                <Bubble
                    className={this.getClasses()}
                    alignPoints={[
                        { align: 'cr cl' },
                        { align: 'cr bl' },
                        { align: 'cr tl' }
                    ]}
                >
                    <h3>{props.item.get('title')}</h3>
                    <p className="adi-item-description">{props.item.get('summary')}</p>
                    <h4><FormattedMessage id="dashboard.catalogue_item.type" /></h4>
                    <p className="adi-item-type">
                        <FormattedMessage id={`bucket_item_types.${props.item.get('type')}`} />
                    </p>
                    {this.renderContent()}
                </Bubble>
            </BubbleHoverTrigger>
        );
    }
}

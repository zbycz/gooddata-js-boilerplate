import React, { PropTypes } from 'react';
import classNames from 'classnames';
import pureRender from 'pure-render-decorator';

import Bubble from 'Bubble/ReactBubble';
import BubbleHoverTrigger from 'Bubble/ReactBubbleHoverTrigger';
import { FormattedMessage } from 'react-intl';

@pureRender
export default class VisualizationPicker extends React.Component {
    static propTypes = {
        selected: PropTypes.string.isRequired,
        types: PropTypes.object.isRequired,
        onClick: PropTypes.func.isRequired
    };

    handleClick(type) {
        if (this.props.selected !== type) {
            this.props.onClick(type);
        }
    }

    renderButton(visualizationType) {
        let type = visualizationType.get('type'),
            classes = classNames(
                'vis',
                's-visualization',
                `vis-type-${type}`,
                {
                    'is-selected': this.props.selected === type
                }
            );

        return (
            <BubbleHoverTrigger showDelay={0} hideDelay={0} key={type} className={classes} >
                <button
                    className={`s-vis-button-${type}`}
                    onClick={() => this.handleClick(type)}
                    title={visualizationType.get('title')}
                />
                <Bubble
                    className="bubble-primary"
                    alignPoints={[{ align: 'bc tc' }]}
                >
                    <FormattedMessage id={type} />
                </Bubble>
            </BubbleHoverTrigger>
        );
    }

    render() {
        return (
            <div className="adi-visualization-picker s-visualization-picker">
                {this.props.types.map(type => this.renderButton(type)).toArray()}
            </div>
        );
    }
}

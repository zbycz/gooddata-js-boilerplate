import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

export default class ReportMessage extends Component {
    static propTypes = {
        messageId: PropTypes.string.isRequired,
        className: PropTypes.string,
        links: PropTypes.arrayOf(
            PropTypes.shape({
                action: PropTypes.func.isRequired,
                messageId: PropTypes.string.isRequired
            })
        ),
        isBlank: PropTypes.bool
    };

    static defaultProps = {
        links: [],
        isBlank: false
    }

    getClassName() {
        const blank = this.props.isBlank ? 'blank-' : '';
        const classes = [`adi-${blank}canvas-message`, `s-${blank}canvas-message`];

        return classNames(classes, this.props.className);
    }

    getMessageRootId() {
        return `dashboard.message.${this.props.messageId}`;
    }

    getEmbeddedValues() {
        const { links } = this.props;

        return links.reduce((memo, link) => {
            const linkClass = `s-${link.messageId.replace(/_/g, '-')}`;

            memo[link.messageId] = (
                <a onClick={link.action} className={linkClass}>
                    <FormattedMessage id={`${this.getMessageRootId()}.${link.messageId}`} />
                </a>
            );
            return memo;
        }, { br: <br /> });
    }

    render() {
        return (
            <div className={this.getClassName()}>
                <h2><FormattedMessage id={`${this.getMessageRootId()}.header`} /></h2>
                <p>
                    <FormattedMessage
                        id={`${this.getMessageRootId()}.description`}
                        values={this.getEmbeddedValues()}
                    />
                </p>
            </div>
        );
    }
}

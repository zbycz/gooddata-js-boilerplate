import React, { Component, PropTypes } from 'react';
import { injectIntl, FormattedHTMLMessage } from 'react-intl';
import { shortenText } from '../../utils/base';
import { FACT } from '../../constants/CatalogueItemTypes';

const MAX_TITLE_LENGTH = 45;

export class ShortcutTitle extends Component {
    static propTypes = {
        translationKey: PropTypes.string.isRequired,
        title: PropTypes.string,
        itemType: PropTypes.string,
        intl: PropTypes.object.isRequired,
        tagName: PropTypes.string
    };

    static defaultProps = {
        tagName: 'p'
    };

    getDecoratedTitle() {
        let title = this.props.title;

        if (this.props.itemType === FACT) {
            title = this.props.intl.formatMessage({
                id: 'aggregations.metric_title.SUM'
            }, { title });
        }

        return shortenText(title, {
            maxLength: MAX_TITLE_LENGTH
        });
    }

    render() {
        let intlProps = {
            id: this.props.translationKey,
            tagName: this.props.tagName
        };

        if (this.props.title) {
            intlProps.values = {
                decoratedTitle: this.getDecoratedTitle()
            };
        }

        return (
            <FormattedHTMLMessage {...intlProps} />
        );
    }
}

export default injectIntl(ShortcutTitle);

import React, { PropTypes } from 'react';
import pureRender from 'pure-render-decorator';
import { injectIntl, intlShape } from 'react-intl';

import { DATE_DATASET_ATTRIBUTE } from '../../models/date_item';

@pureRender
export class FilterLabel extends React.Component {
    static propTypes = {
        filter: PropTypes.object,
        intl: intlShape
    };

    constructor(props) {
        super(props);

        this.state = { hasEllipsis: false };
        this.setLabelRef = this.setLabelRef.bind(this);
    }

    componentDidMount() {
        this.checkEllipsis();
    }

    componentDidUpdate() {
        this.checkEllipsis();
    }

    setLabelRef(ref) {
        this.labelRef = ref;
    }

    getIsDate() {
        return this.props.filter.getIn(['attribute', 'identifier']) === DATE_DATASET_ATTRIBUTE;
    }

    checkEllipsis() {
        const { offsetWidth, scrollWidth } = this.labelRef;
        // for some reason, IE11 returns offsetWidth = scrollWidth - 1 even when there is no ellipsis
        const hasEllipsis = offsetWidth < scrollWidth - 1;
        if (hasEllipsis !== this.state.hasEllipsis) {
            this.setState({ hasEllipsis });
        }
    }

    renderSelectionLabel(content) {
        return <span className="count s-total-count">{content}</span>;
    }

    renderSelection() {
        if (!this.getIsDate()) {
            const { filter, intl } = this.props;

            if (filter.get('allSelected')) {
                return this.renderSelectionLabel(intl.formatMessage({ id: 'all' }));
            }

            if (this.state.hasEllipsis) {
                const selectionSize = filter.get('selectionSize');
                if (selectionSize > 0) {
                    return this.renderSelectionLabel(`(${selectionSize})`);
                }
            }
        }

        return false;
    }

    render() {
        const { filter } = this.props;
        const baseTitle = filter.get('ellipsedTitle') || filter.get('title') || '';
        // if all items are selected and title is cropped, remove ': All' at end of title
        // because we are going to display it in a separate span instead
        const title = (!this.getIsDate() && filter.get('allSelected')) ?
            baseTitle.replace(/:[^:]*$/, ':') : baseTitle;

        return (
            <div className="adi-attribute-filter-label s-attribute-filter-label">
                <span className="label" ref={this.setLabelRef}>{title}</span>
                {this.renderSelection()}
            </div>
        );
    }
}

export default injectIntl(FilterLabel);

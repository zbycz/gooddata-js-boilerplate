import { List } from 'immutable';
import React from 'react';

import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import pureRender from 'pure-render-decorator';

import FilterLabel from '../shared/FilterLabel';

@pureRender
export default class BucketItemHeader extends React.Component {
    static propTypes = {
        title: React.PropTypes.string,
        filters: React.PropTypes.object,
        isCollapsed: React.PropTypes.bool,
        onToggleCollapse: React.PropTypes.func
    };

    static defaultProps = {
        filters: List()
    };

    getClassNames() {
        let isCollapsed = this.props.isCollapsed;
        return classNames(
            'adi-bucket-item-header',
            's-bucket-item-header',
            {
                expanded: !isCollapsed,
                collapsed: isCollapsed
            }
        );
    }

    renderFilters(props) {
        return props.filters.map((filter, idx) => {
            return (
                <div key={idx} className="adi-attribute-filters">
                    <FilterLabel filter={filter} />
                </div>
            );
        }).toArray();
    }

    render() {
        let props = this.props;
        return (
            <div className={this.getClassNames()} onClick={() => props.onToggleCollapse(!props.isCollapsed)}>
                <h4 className="s-title">{props.title}</h4>
                {this.renderFilters(props)}
                <div className="adi-bucket-invitation-inner">
                    <FormattedMessage id="dashboard.bucket_item.replace" />
                </div>
            </div>
        );
    }
}

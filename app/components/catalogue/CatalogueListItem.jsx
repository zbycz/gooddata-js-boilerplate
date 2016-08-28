// Copyright (C) 2007-2016, GoodData(R) Corporation. All rights reserved.

import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import pureRender from 'pure-render-decorator';

import CatalogueItem from './CatalogueItem';
import Header from './CatalogueHeader';

export const LIST_ITEM_HEIGHT = 25;

@pureRender
export default class CatalogueListItem extends Component {
    static propTypes = {
        item: PropTypes.object.isRequired
    };

    render() {
        const { item } = this.props;
        const type = item && item.get('type');

        if (type === 'header') {
            return (
                <Header>
                    <FormattedMessage id="dashboard.project_data" />
                </Header>
            );
        }

        return <CatalogueItem {...this.props} />;
    }
}

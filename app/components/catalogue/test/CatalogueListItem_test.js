import React from 'react';
import { renderIntoDocument, findRenderedComponentWithType } from 'react-addons-test-utils';
import { IntlProvider } from 'react-intl';
import translations from '../../../translations/en';
import { fromJS } from 'immutable';

import CatalogueListItem from '../CatalogueListItem';
import Header from '../CatalogueHeader';
import CatalogueItem from '../CatalogueItem';


describe('CatalogueListItem', () => {
    describe('Component', () => {
        function render(item) {
            return renderIntoDocument(
                <IntlProvider locale="en" messages={translations}>
                    <CatalogueListItem item={item} />
                </IntlProvider>
            );
        }

        const headerItem = fromJS({
            identifier: 'sample_header',
            isGroupHeader: true,
            type: 'header'
        });

        const dateItem = fromJS({
            identifier: 'sample_date',
            title: 'Some title',
            type: 'date',
            isAvailable: true,
            summary: 'Some interesting summary'
        });

        it('should render Header if header item is supplied', () => {
            const component = render(headerItem);
            findRenderedComponentWithType(component, Header);
        });

        it('should render CatalogueItem if date item is supplied', () => {
            const component = render(dateItem);
            findRenderedComponentWithType(component, CatalogueItem);
        });
    });
});

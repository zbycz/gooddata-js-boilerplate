import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { IntlProvider } from 'react-intl';
import translations from '../../../translations/en';

import CatalogueFilter from '../CatalogueFilter';

let {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    scryRenderedDOMComponentsWithClass,
    Simulate: {
        click
    }
} = ReactTestUtils;

describe('Catalogue filter', () => {
    let filters = [{
        name: 'all',
        label: 'catalogue.filter.all',
        types: ['metric', 'attribute', 'fact']
    }, {
        name: 'metrics',
        label: 'catalogue.filter.metrics',
        types: ['metric', 'fact']
    }, {
        name: 'attributes',
        label: 'catalogue.filter.attributes',
        types: ['attribute']
    }];

    let onSelect = sinon.spy(), activeIndex = 1;

    function render() {
        return renderIntoDocument(
            <IntlProvider locale="en" messages={translations}>
                <CatalogueFilter onSelect={onSelect} filters={filters} activeFilterIndex={activeIndex} />
            </IntlProvider>
        );
    }

    it('should find active component', () => {
        let catalogueFilter = render();

        let activeFilter = findRenderedDOMComponentWithClass(catalogueFilter, 'is-active');

        // convert domtokenlist to array
        expect([...activeFilter.classList]).to.contain('s-filter-metrics');
    });

    it('should call onSelect method when clicking non active index', () => {
        let catalogueFilter = render();

        let filterItems = scryRenderedDOMComponentsWithClass(catalogueFilter, 's-filter-item');

        expect(filterItems.length).to.equal(3);

        click(filterItems[0]);

        expect(onSelect).to.be.calledWith(0);
    });
});

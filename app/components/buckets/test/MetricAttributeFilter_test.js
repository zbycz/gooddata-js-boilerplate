import React from 'react';
import {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    Simulate
} from 'react-addons-test-utils';
import MetricAttributeFilter from '../MetricAttributeFilter';
import withIntl from '../../../utils/with_intl';
import createDummyDataSource from 'data/DummyDataSource';

describe('MetricAttributeFilter', () => {
    function render() {
        const dataSourceCreator = () => createDummyDataSource([]);
        const Wrapped = withIntl(MetricAttributeFilter);
        return renderIntoDocument(
            <Wrapped
                dataSourceCreator={dataSourceCreator}
            />
        );
    }

    function findElement(element, query) {
        return element.querySelector(query);
    }

    afterEach(() => {
        // work-around to handle overlays
        document.body.innerHTML = '';
    });

    it('should render filter button', () => {
        const filter = render();
        const button = findRenderedDOMComponentWithClass(filter, 's-metric-attribute-filter-button');
        expect(button).to.be.ok();
    });

    it('should render \'No results matched\' for 0 rows', () => {
        const filter = render();

        const button = findRenderedDOMComponentWithClass(filter, 's-metric-attribute-filter-button');
        Simulate.click(button);

        const noResults = findElement(document, '.gd-list-noResults');
        expect(noResults.textContent).to.equal('No results matched');
    });
});

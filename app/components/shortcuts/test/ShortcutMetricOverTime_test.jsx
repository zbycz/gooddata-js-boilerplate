import React from 'react';
import { List } from 'immutable';
import {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    findRenderedDOMComponentWithTag
} from 'react-addons-test-utils';
import { ShortcutMetricOverTime } from '../ShortcutMetricOverTime';
import withIntl from '../../../utils/with_intl';
import { FACT } from '../../../constants/CatalogueItemTypes';

describe('ShortcutMetricOverTime', () => {
    function render(customProps = {}) {
        const props = {
            itemType: 'bar',
            title: FACT,
            availableDateDataSets: new List(),
            ...customProps
        };
        const Wrapped = withIntl(ShortcutMetricOverTime);
        return renderIntoDocument(<Wrapped {...props} />);
    }

    context('datasets were not loaded yet', () => {
        it('should render loading icon', () => {
            const shortcut = render();

            findRenderedDOMComponentWithClass(shortcut, 's-loading');
        });
    });

    context('no datasets were loaded', () => {
        it('should render cant be trended', () => {
            const shortcut = render({
                areDateDataSetsLoaded: true
            });

            findRenderedDOMComponentWithClass(shortcut, 's-cant-be-trended');
        });
    });

    context('shortcut is ready', () => {
        it('should render decorated title if item is fact', () => {
            const shortcut = render({
                title: 'Some title',
                itemType: FACT,
                areDateDataSetsLoaded: true,
                availableDateDataSets: new List([{ foo: 'bar' }])
            });
            const paragraphContainingText = findRenderedDOMComponentWithTag(shortcut, 'p');
            expect(paragraphContainingText.innerHTML).to.contain('Sum of Some title');
        });
    });
});

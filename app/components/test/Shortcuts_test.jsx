import React from 'react';
import withDragDrop from '../../utils/with_drag_drop_context';
import withIntl from '../../utils/with_intl';
import withRedux from '../../utils/with_redux';
import {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    scryRenderedDOMComponentsWithClass
} from 'react-addons-test-utils';
import { fromJS } from 'immutable';

import { Shortcuts } from '../Shortcuts';

describe('Shortcuts', () => {
    let defaultProps;
    const activeDragItem = fromJS({ title: 'test', type: 'metric' });

    function render(props) {
        const WrappedShortcuts = withDragDrop(withRedux(withIntl(Shortcuts)));

        return renderIntoDocument((
            <WrappedShortcuts {...props} />
        ));
    }

    beforeEach(() => {
        defaultProps = {
            activeDragItem,
            applyAttributeShortcut: sinon.spy(),
            applyMetricShortcut: sinon.spy(),
            applyMetricOverTimeShortcut: sinon.spy(),
            displayBlock: false,
            displayAttribute: false,
            displayMetric: false,
            displayMetricOverTime: false,
            isMetricOverTimeDisabled: false,
            loadShortcutDateDataSets: sinon.spy(),
            dropCatalogueItem: sinon.spy()
        };
    });

    it('should be in blank state by default', () => {
        const shortcuts = render(defaultProps);

        const elems = scryRenderedDOMComponentsWithClass(shortcuts, 'adi-shortcuts-area');
        expect(elems.length).to.eql(0);
    });

    it('should show empty container', () => {
        defaultProps.displayBlock = true;
        const shortcuts = render(defaultProps);

        findRenderedDOMComponentWithClass(shortcuts, 'adi-shortcuts-area');
    });

    it('should show Attribute shortcut', () => {
        defaultProps.displayBlock = true;
        defaultProps.displayAttribute = true;
        const shortcuts = render(defaultProps);

        findRenderedDOMComponentWithClass(shortcuts, 'adi-shortcuts-area');
        findRenderedDOMComponentWithClass(shortcuts, 'adi-shortcut-inner s-recommendation-attribute-canvas');
    });

    it('should show Metric shortcut', () => {
        defaultProps.displayBlock = true;
        defaultProps.displayMetric = true;
        const shortcuts = render(defaultProps);

        findRenderedDOMComponentWithClass(shortcuts, 'adi-shortcuts-area');
        findRenderedDOMComponentWithClass(shortcuts, 'adi-shortcut-inner s-recommendation-metric-canvas');
    });

    context('triggering load of date datasets', () => {
        it('should trigger load if dragged metric', () => {
            render(defaultProps);

            expect(defaultProps.loadShortcutDateDataSets).to.be.called();
        });

        it('should trigger load if dragged fact', () => {
            defaultProps.activeDragItem = fromJS({ type: 'fact' });

            render(defaultProps);

            expect(defaultProps.loadShortcutDateDataSets).to.be.called();
        });

        it('should not trigger load if dragged something else', () => {
            defaultProps.activeDragItem = fromJS({ type: 'attribute' });

            render(defaultProps);

            expect(defaultProps.loadShortcutDateDataSets).not.to.be.called();
        });
    });
});

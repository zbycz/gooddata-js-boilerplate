import { fromJS, List } from 'immutable';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';

import { AttributeFilter } from '../AttributeFilter';
import { decoratedMetricAttributeFilter } from '../../../models/metric_attribute_filter';
import { INITIAL_MODEL, attributeElement, decoratedAttributeElement } from '../../../models/attribute_element';

import withIntl from '../../../utils/with_intl';

let {
    renderIntoDocument,
    findRenderedComponentWithType,
    findRenderedDOMComponentWithClass,
    Simulate: {
        click
    }
} = ReactTestUtils;

describe('AttributeFilter', () => {
    let onLoadAttributeElements, onApply, component, filter, elements;

    function render(autoOpen = false) {
        let Wrapper = withIntl(AttributeFilter),
            wrapper = renderIntoDocument(
                <Wrapper
                    filter={filter}
                    autoOpen={autoOpen}
                    elements={elements}
                    onLoadAttributeElements={onLoadAttributeElements}
                    onApply={onApply}
                    intl={{ formatMessage: () => '' }}
                />
            );

        return findRenderedComponentWithType(wrapper, AttributeFilter);
    }

    beforeEach(() => {
        onLoadAttributeElements = sinon.spy();
        onApply = sinon.spy();

        filter = decoratedMetricAttributeFilter();

        elements = fromJS(INITIAL_MODEL).set('items', []);

        component = render();
    });

    afterEach(() => {
        // work-around to handle overlays
        document.body.innerHTML = '';
    });

    describe('#noItemsSelected', () => {
        it('should be true if no items are selected', () => {
            component.setState({
                selectedElements: List([]),
                isInverted: false
            });

            expect(component.noItemsSelected()).to.equal(true);
        });

        it('should be false if no items are unselected', () => {
            component.setState({
                selectedElements: List([]),
                isInverted: true
            });

            expect(component.noItemsSelected()).to.equal(false);
        });

        it('should be false if one item is selected', () => {
            component.setState({
                selectedElements: List([decoratedAttributeElement(attributeElement())]),
                isInverted: false
            });

            expect(component.noItemsSelected()).to.equal(false);
        });

        it('should be false if one item is unselected', () => {
            component.setState({
                selectedElements: List([decoratedAttributeElement(attributeElement())]),
                isInverted: true
            });

            expect(component.noItemsSelected()).to.equal(false);
        });
    });

    describe('#allItemsUnselected', () => {
        it('should be true when all items are unselected', () => {
            elements = elements.set('total', 3);
            component = render();

            component.setState({
                selectedElements: List([
                    decoratedAttributeElement(attributeElement({ uri: '1' })),
                    decoratedAttributeElement(attributeElement({ uri: '2' })),
                    decoratedAttributeElement(attributeElement({ uri: '3' }))
                ]),
                isInverted: true
            });

            expect(component.allItemsUnselected()).to.equal(true);
        });
    });

    describe('#disabledApply', () => {
        beforeEach(() => {
            component.emptySelection = () => false;
            component.selectionUnchanged = () => false;
        });

        it('should be false by default', () => {
            expect(component.disabledApply()).to.equal(false);
        });

        it('should be true if no items are selected', () => {
            component.emptySelection = () => true;

            expect(component.disabledApply()).to.equal(true);
        });

        it('should be true if there are not changes in selectedElements', () => {
            component.selectionUnchanged = () => true;

            expect(component.disabledApply()).to.equal(true);
        });
    });

    function findElement(element, query) {
        return element.querySelector(query);
    }

    describe('actions', () => {
        describe('dropdown', () => {
            let button;

            beforeEach(() => {
                button = findRenderedDOMComponentWithClass(component, 'adi-filter-button');
                click(button);
            });

            it('clicking button should toggle dropdown display', () => {
                expect(findElement(document, '.adi-filter-picker')).to.be.ok();

                click(button);

                expect(findElement(document, '.adi-filter-picker')).to.equal(null);
            });

            it('should load initial elements when drop down opens', () => {
                expect(onLoadAttributeElements).calledWith('', 0);
            });
        });

        describe('apply', () => {
            beforeEach(() => {
                elements = elements.set('initialItems', List());
                component = render();

                click(findRenderedDOMComponentWithClass(component, 'adi-filter-button'));

                component.setState({ selectedElements: fromJS([{}]) });

                let button = findElement(document, '.s-apply');
                click(button);
            });

            it('should close the dropdown', () => {
                expect(findElement(document, '.adi-filter-picker')).to.equal(null);
            });

            it('should call onApply', () => {
                expect(onApply).to.be.called();
            });
        });

        describe('close', () => {
            beforeEach(() => {
                elements = elements.set('initialItems', List());
                component = render();

                component.emptySelection = () => false;
                component.selectionUnchanged = () => false;

                click(findRenderedDOMComponentWithClass(component, 'adi-filter-button'));

                let button = findElement(document, '.cancel-button');
                click(button);
            });

            it('should close the dropdown', () => {
                expect(findElement(document, '.adi-filter-picker')).to.equal(null);
            });

            it('should not call onApply', () => {
                expect(onApply).not.to.be.called();
            });
        });

        describe('auto open', () => {
            beforeEach(() => {
                component = render(true);
            });

            it('should autoopen the dialog when flag is set', () => {
                expect(findElement(document, '.adi-filter-picker')).to.be.ok();
            });

            it('should load initial elements', () => {
                expect(onLoadAttributeElements).calledWith('', 0);
            });
        });
    });
});

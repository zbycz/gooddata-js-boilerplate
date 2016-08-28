import React from 'react';
import { fromJS } from 'immutable';

import { ConfigurationCheckboxes } from '../ConfigurationCheckboxes';

import {
    renderIntoDocument,
    Simulate,
    findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';

const change = Simulate.change;

describe('ConfigurationCheckboxes', () => {
    const item = 'original item';

    const bucketItem = fromJS({
        original: item,
        showInPercent: false,
        showPoP: false
    });

    let setBucketItemShowInPercent, setBucketItemShowPoP;

    function render(customProps = {}) {
        const props = {
            bucketItem,
            setBucketItemShowPoP,
            setBucketItemShowInPercent,
            ...customProps
        };

        return renderIntoDocument(
            <ConfigurationCheckboxes {...props} />
        );
    }

    beforeEach(() => {
        setBucketItemShowInPercent = sinon.spy();
        setBucketItemShowPoP = sinon.spy();
    });

    describe('actions', () => {
        it('triggers setBucketItemShowInPercent when user clicks checkbox', () => {
            let checkboxes = render(),
                checkbox = findRenderedDOMComponentWithClass(checkboxes, 's-show-in-percent');

            change(checkbox, { 'target': { 'checked': true } });
            expect(setBucketItemShowInPercent).to.be.calledWith({ item, value: true });

            change(checkbox, { 'target': { 'checked': false } });
            expect(setBucketItemShowInPercent).to.be.calledWith({ item, value: false });
        });

        it('triggers setBucketItemShowPoP when user clicks checkbox', () => {
            let checkboxes = render(),
                checkbox = findRenderedDOMComponentWithClass(checkboxes, 's-show-pop');

            change(checkbox, { 'target': { 'checked': true } });
            expect(setBucketItemShowPoP).calledWith({ item, value: true });

            change(checkbox, { 'target': { 'checked': false } });
            expect(setBucketItemShowPoP).calledWith({ item, value: false });
        });
    });

    describe('disabled states', () => {
        it('should disable in percent', () => {
            let checkboxes = render({ isShowInPercentDisabled: true }),
                checkbox = findRenderedDOMComponentWithClass(checkboxes, 's-show-in-percent');

            expect(checkbox.hasAttribute('disabled')).to.equal(true);
        });

        it('should disable pop', () => {
            let checkboxes = render({ isShowPoPDisabled: true }),
                checkbox = findRenderedDOMComponentWithClass(checkboxes, 's-show-pop');

            expect(checkbox.hasAttribute('disabled')).to.equal(true);
        });
    });
});

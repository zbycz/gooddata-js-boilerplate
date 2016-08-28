import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';

import { fromJS } from 'immutable';
import VisualizationPicker from '../VisualizationPicker';

let {
    renderIntoDocument,
    scryRenderedDOMComponentsWithClass,
    findRenderedDOMComponentWithClass,
    Simulate: {
        click
    }
} = ReactTestUtils;

describe('VisualizationPicker', () => {
    let picker, callback;

    function renderPicker(types, selectedType = null) {
        return renderIntoDocument(<VisualizationPicker types={types} selected={selectedType} onClick={callback} />);
    }

    beforeEach(() => {
        callback = sinon.spy();

        picker = renderPicker(fromJS([{ type: 'bar', title: 'Bar' }, { type: 'line', title: 'Line' }]), 'line');
    });

    afterEach(() => {
        callback.reset();
    });

    it('renders types', () => {
        let typeButtons = scryRenderedDOMComponentsWithClass(picker, 'vis');

        expect(typeButtons).to.have.length(2);

        expect(findRenderedDOMComponentWithClass(picker, 'vis-type-bar')).to.be.ok();
        expect(findRenderedDOMComponentWithClass(picker, 'vis-type-line')).to.be.ok();
    });

    it('sets the button\'s title', () => {
        let bar = findRenderedDOMComponentWithClass(picker, 's-vis-button-bar');

        expect(bar.getAttribute('title')).to.equal('Bar');
    });

    it('sets is-selected class on selected type', () => {
        let selected = findRenderedDOMComponentWithClass(picker, 'is-selected');
        let line = findRenderedDOMComponentWithClass(picker, 'vis-type-line');

        expect(selected).to.equal(line);
    });

    it('calls given callback on click', () => {
        let bar = findRenderedDOMComponentWithClass(picker, 's-vis-button-bar');

        click(bar);

        expect(callback).to.be.calledWith('bar');
    });

    it('does not call callback if nothing changed', () => {
        let line = findRenderedDOMComponentWithClass(picker, 's-vis-button-line');

        click(line);

        expect(callback).not.to.be.called();
    });
});

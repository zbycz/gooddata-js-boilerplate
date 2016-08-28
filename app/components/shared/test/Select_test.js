import React from 'react';
import { renderIntoDocument, scryRenderedDOMComponentsWithTag } from 'react-addons-test-utils';

import Select from '../Select';


describe('Select', () => {
    function renderSelect(content, selected) {
        return renderIntoDocument(
            <Select
                className="s-date-dataset-switch adi-date-dataset-switch"
                content={content}
                value={selected}
                optionValuePath="identifier"
                optionLabelPath="attributeTitle"
                optionDisabledPath="isDisabled"
                optionGroupPath="availabilityTitle"
                disabled={false}
            />
        );
    }

    let selectSource = [
        {
            identifier: 'A',
            attributeTitle: 'Title A',
            isDisabled: false,
            availabilityTitle: 'Available'
        },
        {
            identifier: 'B',
            attributeTitle: 'Title B',
            isDisabled: false,
            availabilityTitle: 'Available'
        },
        {
            identifier: 'C',
            attributeTitle: 'Title C',
            isDisabled: true,
            availabilityTitle: 'Unavailable'
        }
    ];

    it('should render two option groups with propper names', () => {
        let select = renderSelect(selectSource);
        let groups = scryRenderedDOMComponentsWithTag(select, 'optgroup');
        expect(groups.map(group => group.getAttribute('label'))).to.eql(['Available', 'Unavailable']);
    });

    it('should render A, B items in first "available" optgroup', () => {
        let select = renderSelect(selectSource);
        let groups = scryRenderedDOMComponentsWithTag(select, 'optgroup');
        let options = Array.prototype.slice.call(groups[0].childNodes);
        expect(options.map(option => option.text)).to.eql(['Title A', 'Title B']);
        expect(options.map(option => option.value)).to.eql(['A', 'B']);
    });

    it('should render C item in second "unavailable" optgroup', () => {
        let select = renderSelect(selectSource);
        let groups = scryRenderedDOMComponentsWithTag(select, 'optgroup');
        let options = Array.prototype.slice.call(groups[1].childNodes);
        expect(options.map(option => option.text)).to.eql(['Title C']);
        expect(options.map(option => option.value)).to.eql(['C']);
    });

    it('should select second option (B)', () => {
        let select = renderSelect(selectSource, 'B');
        let options = scryRenderedDOMComponentsWithTag(select, 'option');
        let selected = options[1].hasAttribute('selected');
        expect(selected).to.equal(true);
    });

    it('should disable last option C', () => {
        let select = renderSelect(selectSource);
        let options = scryRenderedDOMComponentsWithTag(select, 'option');
        let disabled = options[2].hasAttribute('disabled');
        expect(disabled).to.equal(true);
    });
});

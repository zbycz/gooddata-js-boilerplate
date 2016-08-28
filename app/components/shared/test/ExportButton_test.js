import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { ExportButton } from '../ExportButton';
import withIntl from '../../../utils/with_intl';
import { fromJS } from 'immutable';

const {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    Simulate: {
        click
    }
} = ReactTestUtils;

describe('ExportButton', () => {
    function render(customProps = {}) {
        const Wrapped = withIntl(ExportButton);
        const defaultProps = {
            onExport: () => {}
        };
        const props = { ...defaultProps, ...customProps };
        return renderIntoDocument(
            <Wrapped
                {...props}
            />
        );
    }

    it('should trigger onExport on click if button is not disabled', () => {
        const onExport = sinon.spy();
        const props = { onExport, isExportDisabled: false };
        const button = findRenderedDOMComponentWithClass(render(props), 's-export-to-report');
        click(button);
        expect(onExport).to.be.calledOnce();
    });

    it('should not trigger onExport if button is disabled', () => {
        const onExport = sinon.spy();
        const props = { onExport, isExportDisabled: true };
        const button = findRenderedDOMComponentWithClass(render(props), 's-export-to-report');
        click(button);
        expect(onExport).not.to.be.called();
    });

    it('should not trigger onExport if duplicatedObject is provided', () => {
        const onExport = sinon.spy();
        const duplicatedObject = fromJS({ type: 'attribute', title: 'foo' });
        const props = { onExport, duplicatedObject };
        const button = findRenderedDOMComponentWithClass(render(props), 's-export-to-report');
        click(button);
        expect(onExport).not.to.be.called();
    });
});

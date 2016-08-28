import React from 'react';
import withIntl from '../../utils/with_intl';
import withRedux from '../../utils/with_redux';
import {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    scryRenderedDOMComponentsWithClass
} from 'react-addons-test-utils';

import { Report } from '../Report';

describe('Report', () => {
    function render(type, props) {
        let WrappedReport = withRedux(withIntl(Report));

        return renderIntoDocument((
            <WrappedReport config={{ type, buckets: {} }} {...props} />
        ));
    }

    it('should be in blank state by default', () => {
        let report = render('table');

        findRenderedDOMComponentWithClass(report, 's-blank-canvas-message');
    });

    it('should be showing special message if report is empty', () => {
        let report = render('table', { isReportEmpty: true });

        findRenderedDOMComponentWithClass(report, 's-error-empty-result');
    });

    it('should be showing special message if execution is running', () => {
        let report = render('table', { isExecutionRunning: true });

        findRenderedDOMComponentWithClass(report, 's-report-computing');
    });

    it('should be showing special message if shortcut is reporting', () => {
        let report = render('table', { isComputingShortcut: true });

        findRenderedDOMComponentWithClass(report, 's-report-computing');
    });

    it('should be showing special message if report is too large', () => {
        let report = render('table', { isReportTooLarge: true });

        findRenderedDOMComponentWithClass(report, 's-error-too-many-data-points');
    });

    it('should show error message on invalid configuration error', () => {
        let report = render('table', { isInvalidConfiguration: true });

        findRenderedDOMComponentWithClass(report, 's-error-invalid-configuration');
    });

    it('should not show error message on invalid configuration error', () => {
        let report = render('table', { isInvalidConfiguration: false });

        let errorMessages = scryRenderedDOMComponentsWithClass(report, 's-error-invalid-configuration');
        expect(errorMessages.length).to.equal(0);
    });

    it('should be showing computing message if report is being executed', () => {
        let report = render('table', { isExecutionRunning: true });

        findRenderedDOMComponentWithClass(report, 's-report-computing');
    });

    describe('table', () => {
        it('should be showing table if data is present', () => {
            let report = render('table', { data: { headers: [], rawData: [] } });

            findRenderedDOMComponentWithClass(report, 's-visualization-table');
        });
    });
});

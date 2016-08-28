import React from 'react';
import { EditorHeader } from '../EditorHeader.jsx';
import {
    renderIntoDocument,
    scryRenderedDOMComponentsWithClass,
    findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';
import withRedux from '../../utils/with_redux';
import * as StatePaths from '../../constants/StatePaths';

describe('EditorHeader', () => {
    function setupProjectId(state) {
        return state.setIn([...StatePaths.PROJECT_ID], 'my project');
    }

    function render(userProps, prepareStateFunction = setupProjectId) {
        const defaultProps = {
            onUndo: () => {},
            onRedo: () => {},
            onResetReport: () => {}
        };

        const props = { ...defaultProps, ...userProps };
        const Wrapped = withRedux(EditorHeader, prepareStateFunction);

        return renderIntoDocument(<Wrapped {...props} />);
    }

    describe('Wrapper', () => {
        it('should have \'without-dataset-picker\' class when \'isTitleDisabled\' is false', () => {
            let component = render({
                isTitleDisabled: false
            });

            let wrapperDiv = findRenderedDOMComponentWithClass(component, 'adi-editor-header without-dataset-picker');

            expect(wrapperDiv).to.be.ok();
        });

        it('shouldn\'t have \'without-dataset-picker\' class when \'isTitleDisabled\' is false', () => {
            let component = render({
                isTitleDisabled: true
            });

            let wrapperDivWithClass = scryRenderedDOMComponentsWithClass(
                component,
                'adi-editor-header without-dataset-picker');
            let wrapperDiv = findRenderedDOMComponentWithClass(component, 'adi-editor-header');

            expect(wrapperDivWithClass).to.have.length(0);
            expect(wrapperDiv.title).to.eql('');
        });

        it('should contain SaveReportButton', () => {
            const component = render({});

            const button = findRenderedDOMComponentWithClass(component, 's-save-button');
            expect(button).to.be.ok();
        });
    });

    describe('Application title', () => {
        it('shouldn\'t contain title if \'isTitleDisabled\' is true', () => {
            let component = render({
                isTitleDisabled: true
            });
            let appTitle = scryRenderedDOMComponentsWithClass(component, 's-adi-application-title');
            expect(appTitle).to.have.length(0);
        });

        it('should contain title if \'isTitleDisabled\' is false', () => {
            let component = render({
                isTitleDisabled: false
            });

            const title = findRenderedDOMComponentWithClass(component, 's-adi-application-title');
            expect(title).to.be.ok();
        });
    });

    describe('Save as new button', () => {
        it('shouldn\'t contain save as new button when is not any report openned', () => {
            let component = render({
                isReportSaved: false
            });
            let saveAsNewButton = scryRenderedDOMComponentsWithClass(component, 's-save-as-new-button');
            expect(saveAsNewButton).to.be.empty();
        });

        it('should contain save as new button when is report saved', () => {
            let component = render({
                isReportSaved: true
            });
            let saveAsNewButton = scryRenderedDOMComponentsWithClass(component, 's-save-as-new-button');
            expect(saveAsNewButton).to.be.ok();
        });
    });

    describe('Open as report button', () => {
        it('shouldn\'t contain open as report button when application is embedded', () => {
            let component = render({
                isEmbedded: true
            });
            let openAsReportButton = scryRenderedDOMComponentsWithClass(component, 's-open_as_report');
            expect(openAsReportButton).to.be.empty();
        });

        it('should contain open as report button when application is not embedded', () => {
            let component = render({
                isEmbedded: true
            });
            let openAsReportButton = scryRenderedDOMComponentsWithClass(component, 's-open_as_report');
            expect(openAsReportButton).to.be.ok();
        });
    });
});

import React from 'react';
import ReportTitle from '../ReportTitle.jsx';
import {
    renderIntoDocument,
    findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';
import withRedux from '../../utils/with_redux';
import * as StatePaths from '../../constants/StatePaths';

describe('ReportTitle', () => {
    function setupProjectId(state) {
        return state.setIn([...StatePaths.PROJECT_ID], 'my project');
    }

    function render(userProps, prepareStateFunction = setupProjectId) {
        const Wrapped = withRedux(ReportTitle, prepareStateFunction);

        return renderIntoDocument(<Wrapped {...userProps} />);
    }

    describe('Report title', () => {
        it('should render EditableLabel with label foo', () => {
            const currentTitle = 'foo';
            let component = render({}, state => setupProjectId(state).setIn(StatePaths.REPORT_CURRENT_TITLE, currentTitle));

            const title = findRenderedDOMComponentWithClass(component, 's-report-title');

            expect(title).to.be.ok();
            expect(title.innerHTML).to.equal(currentTitle);
        });
    });
});

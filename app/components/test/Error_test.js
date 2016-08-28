import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { List } from 'immutable';

import { Error } from '../Error.jsx';
import * as Errors from '../../constants/Errors';
import withIntl from '../../utils/with_intl';

let { renderIntoDocument, findRenderedDOMComponentWithClass } = ReactTestUtils;

describe('Error component', () => {
    function render(errors) {
        const Wrapped = withIntl(Error);
        return renderIntoDocument(<Wrapped errors={errors} projectId="" />);
    }

    it('should render last error in array', () => {
        const component = render(List([
            { type: Errors.CREATE_REPORT_DENIED_ERROR },
            { type: Errors.NO_PROJECT_AVAILABLE_ERROR }
        ]));

        const errorElement = findRenderedDOMComponentWithClass(component, 's-canvas-message');

        expect(errorElement.textContent).to.contain('No available project found.');
    });
});

import React from 'react';
import {
    renderIntoDocument,
    findRenderedComponentWithType
} from 'react-addons-test-utils';
import { List } from 'immutable';
import { Root } from '../Root';
import withIntl from '../../utils/with_intl';

describe('Root', () => {
    function render(customProps = {}) {
        const defaultProps = {
            bootstrap: () => {},
            errors: new List(),
            isAppReady: false,
            pageTitle: 'Test'
        };
        const props = { ...defaultProps, ...customProps };
        const Wrapped = withIntl(Root);

        return renderIntoDocument(<Wrapped {...props} />);
    }

    it('should not trigger historyStatePopped on window state change if project id is missing', () => {
        const props = {
            projectId: null,
            historyStatePopped: sinon.spy()
        };

        const root = findRenderedComponentWithType(render(props), Root);
        root.onStateChanged();

        expect(props.historyStatePopped).not.to.be.called();
    });
});

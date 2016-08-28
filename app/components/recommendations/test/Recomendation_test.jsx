import React from 'react';
import withIntl from '../../../utils/with_intl';
import {
    renderIntoDocument,
    findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';

import Recommendation from '../Recommendation';

describe('Recommendation', () => {
    let recommendation;
    const testType = 'test-type';

    function render(type, children) {
        let Wrapped = withIntl(Recommendation);

        return renderIntoDocument((
            <Wrapped type={type} children={children} />
        ));
    }

    beforeEach(() => {
        recommendation = render(testType, (<div className="child">test child</div>));
    });

    it('should set type classes', () => {
        findRenderedDOMComponentWithClass(recommendation, `adi-recommendation-${testType}`);
        findRenderedDOMComponentWithClass(recommendation, `s-recommendation-${testType}`);
    });

    it('should insert child element', () => {
        findRenderedDOMComponentWithClass(recommendation, 'child');
    });
});

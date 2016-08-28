import React from 'react';
import NoDateAvailable from '../NoDateAvailable';

import { renderIntoDocument, findRenderedDOMComponentWithClass } from 'react-addons-test-utils';
import withIntl from '../../../utils/with_intl';

describe('NoDateAvailable', () => {
    function render() {
        const Wrapped = withIntl(NoDateAvailable);

        return renderIntoDocument((
            <Wrapped
                message="dashboard.bucket_item.no_date_available_category"
            />
        ));
    }

    it('should contain explanation', () => {
        const explanation = findRenderedDOMComponentWithClass(render(), 's-explanation');

        expect(explanation.innerText).to.eql('Measure cannot be trended');
    });
});

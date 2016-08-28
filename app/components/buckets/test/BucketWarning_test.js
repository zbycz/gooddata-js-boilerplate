import React from 'react';
import {
    renderIntoDocument,
    scryRenderedDOMComponentsWithClass,
    scryRenderedComponentsWithType
} from 'react-addons-test-utils';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';

import BucketWarning from '../BucketWarning';

import withIntl from '../../../utils/with_intl';


describe('BucketWarning', () => {
    const Wrapped = withIntl(BucketWarning);

    function render(props = {}) {
        return renderIntoDocument(
            <Wrapped
                keyName="metrics"
                visualizationType="column"
                {...props}
            />
        );
    }

    it('should not render warning', () => {
        let config = render(),
            warning = scryRenderedDOMComponentsWithClass(config, 's-stack-warn')[0];

        expect(warning).to.equal(undefined);
    });

    it('should render warning: no more metric items [stack by]', () => {
        let config = render({ canAddMoreItems: false }),
            warning = scryRenderedComponentsWithType(config, FormattedHTMLMessage)[0];

        expect(warning.props.id).to.equal('dashboard.bucket.metric_stack_by_warning');
    });

    it('should render warning: no more metric items [segment by]', () => {
        let config = render({ canAddMoreItems: false, visualizationType: 'line' }),
            warning = scryRenderedComponentsWithType(config, FormattedHTMLMessage)[0];

        expect(warning.props.id).to.equal('dashboard.bucket.metric_segment_by_warning');
    });

    it('should render warning: no more category items [stack by]', () => {
        let config = render({ keyName: 'stacks', canAddMoreItems: false }),
            warning = scryRenderedComponentsWithType(config, FormattedMessage)[0];

        expect(warning.props.id).to.equal('dashboard.bucket.category_stack_by_warning');
    });

    it('should render warning: no more category items [segment by]', () => {
        let config = render({ keyName: 'stacks', canAddMoreItems: false, visualizationType: 'line' }),
            warning = scryRenderedComponentsWithType(config, FormattedMessage)[0];

        expect(warning.props.id).to.equal('dashboard.bucket.category_segment_by_warning');
    });
});

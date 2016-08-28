import React from 'react';
import { renderIntoDocument, findRenderedDOMComponentWithTag } from 'react-addons-test-utils';
import ShortcutTitle from '../ShortcutTitle';
import withIntl from '../../../utils/with_intl';

describe('ShortcutTitle', () => {
    describe('fact base metric shortcut', () => {
        function createTitle() {
            const props = {
                itemType: 'fact',
                title: 'Title <button id="xss" />',
                translationKey: 'shortcut.metric_over_time'
            };

            const Wrapped = withIntl(ShortcutTitle);
            const title = renderIntoDocument(<Wrapped {...props} />);
            return findRenderedDOMComponentWithTag(title, 'p');
        }

        it('should escape the html inside the title', () => {
            const button = document.querySelector('#xss');
            const expectedTitle = /&lt;button\sid="xss"\s\/&gt;/;
            const title = createTitle();
            expect(button).to.not.be.ok();
            expect(expectedTitle.test(title.innerHTML)).to.be.true();
        });

        it('should append html to the title that won\'t be scaped', () => {
            const title = createTitle();
            const expectedHTMLinTitle = /<strong>[^<]+<\/strong>/;
            expect(expectedHTMLinTitle.test(title.innerHTML)).to.be.true();
        });
    });
});

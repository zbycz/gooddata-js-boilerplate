import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { fromJS } from 'immutable';
import $ from 'jquery';

import { IntlProvider } from 'react-intl';
import translations from '../../../translations/en';

import CatalogueDetailsBubble from '../CatalogueDetailsBubble';

let {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    Simulate: {
        mouseEnter,
        mouseLeave
    }
} = ReactTestUtils;

describe('Catalogue Details Bubble', () => {
    let item = fromJS({
            type: 'date',
            title: 'My Date',
            summary: 'My summary',
            identifier: 'foobar'
        }),

        icon, hover, onShowTooltip;

    function render(catalogueItem) {
        return renderIntoDocument(
            <IntlProvider locale="en" messages={translations}>
                <CatalogueDetailsBubble item={catalogueItem} onShowBubble={onShowTooltip} />
            </IntlProvider>
        );
    }

    function init(catalogueItem) {
        icon = render(catalogueItem);
        hover = findRenderedDOMComponentWithClass(icon, 'gd-bubble-trigger');
    }

    beforeEach(() => {
        onShowTooltip = sinon.spy();
    });

    afterEach(() => {
        // work-around to handle overlays
        document.body.innerHTML = '';
    });

    function scryElements(root, selector) {
        return $(root).find(selector);
    }

    function findBubble() {
        // work-around to handle overlays
        return scryElements(document.body, '.s-catalogue-bubble')[0];
    }

    function async(callback) {
        setTimeout(callback, 1);
    }

    it('shows bubble when mouse hovers over icon', done => {
        init(item);

        let bubble = findBubble();
        expect(bubble).not.to.be.ok();

        mouseEnter(hover);

        // React BubbleTrigger show/hide bubble is asynchronous
        async(() => {
            bubble = findBubble();
            expect(bubble).to.be.ok();

            mouseLeave(hover);

            async(() => {
                bubble = findBubble();
                expect(bubble).not.to.be.ok();

                done();
            });
        });
    });

    it('calls show tooltip when mouse hovers over icon', () => {
        init(item);

        hover = findRenderedDOMComponentWithClass(icon, 'inlineBubbleHelp');
        mouseEnter(hover);

        expect(onShowTooltip).to.be.called();
    });

    it('renders basic item info', done => {
        init(item);

        mouseEnter(hover);

        async(() => {
            let bubble = findBubble();
            expect(bubble.textContent).to.contain(item.get('title'));
            expect(bubble.textContent).to.contain(item.get('summary'));

            done();
        });
    });


    it('renders icon', () => {
        init(item);

        findRenderedDOMComponentWithClass(icon, 'inlineBubbleHelp');
    });

    it('renders correct bubble style when loading', done => {
        init(item);

        mouseEnter(hover);

        async(() => {
            let bubble = findBubble();
            expect(bubble.className).to.contain('s-catalogue-bubble-loading');
            expect(bubble.className).not.to.contain('s-catalogue-bubble-loaded');
            done();
        });
    });

    it('renders correct bubble style when loaded', done => {
        item = item.set('details', {});
        init(item);

        mouseEnter(hover);

        async(() => {
            let bubble = findBubble();
            expect(bubble.className).not.to.contain('s-catalogue-bubble-loading');
            expect(bubble.className).to.contain('s-catalogue-bubble-loaded');
            done();
        });
    });

    it('renders metric', done => {
        item = item
            .set('type', 'metric')
            .set('details', fromJS({ metricMaql: [] }));

        init(item);

        mouseEnter(hover);

        async(() => {
            let bubble = findBubble();
            expect(scryElements(bubble, '.adi-metric-maql')).to.have.length(1);
            done();
        });
    });

    it('renders attribute', done => {
        item = item
            .set('type', 'attribute')
            .set('details', fromJS({ attrElements: [{}] }));
        init(item);

        mouseEnter(hover);

        async(() => {
            let bubble = findBubble();
            expect(scryElements(bubble, '.s-attribute-element')).to.have.length(1);
            done();
        });
    });

    it('renders fact', done => {
        item = item
            .set('type', 'fact')
            .set('details', fromJS({ dataset: [{}] }));
        init(item);

        mouseEnter(hover);

        async(() => {
            let bubble = findBubble();
            expect(scryElements(bubble, '.s-dataset-name')).to.have.length(1);
            done();
        });
    });
});

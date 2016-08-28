import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { fromJS, List, Record } from 'immutable';

import { MetricFilters } from '../MetricFilters';
import withIntl from '../../../../utils/with_intl';

const {
    renderIntoDocument,
    findRenderedDOMComponentWithClass,
    Simulate: {
        click
    }
} = ReactTestUtils;

describe('MetricFilters', () => {
    const defaultProps = {
        projectId: 'my project',
        loadAttributeElements: () => {},
        setBucketItemAddMetricFilter: () => {},
        setBucketItemRemoveMetricFilter: () => {},
        setBucketItemUpdateMetricFilter: () => {}
    };

    function render(customProps) {
        const Wrapped = withIntl(MetricFilters);

        const props = { ...defaultProps, ...customProps };

        return renderIntoDocument((
            <Wrapped {...props} />
        ));
    }

    afterEach(() => {
        // work-around to handle overlays
        document.body.innerHTML = '';
    });

    const DummyFilter = Record({
        original: null,
        selectionEquals: () => false
    });

    const bucketItemOriginal = Symbol('bucket-item');
    const filterOriginal = Symbol('filter-item');

    function createBucketItem(filters = []) {
        return fromJS({
            filters,
            original: bucketItemOriginal,
            aggregation: '',
            attribute: {
                uri: '/bucket/item/attribute',
                dataset: 'My Dataset',
                type: 'attribute'
            }
        });
    }

    function createFilter() {
        return new DummyFilter({
            original: filterOriginal
        });
    }

    function createElements(items = []) {
        return fromJS({
            total: items.length,
            filteredTotal: items.length,
            initialItems: [],
            isLoading: false
        }).set('items', items);
    }

    describe('AttributeFilter', () => {
        const bucketItem = createBucketItem([createFilter()]);

        it('renders filter button if there are some filters in bucket item', () => {
            const elements = createElements();

            const filters = render({ bucketItem, elements });

            findRenderedDOMComponentWithClass(filters, 's-filter-button');
        });

        it('removes filter on remove button click', () => {
            const elements = createElements();

            const setBucketItemRemoveMetricFilter = sinon.spy();

            const filters = render({ bucketItem, elements, setBucketItemRemoveMetricFilter });

            const button = findRenderedDOMComponentWithClass(filters, 's-remove-attribute-filter');

            click(button);

            expect(setBucketItemRemoveMetricFilter).to.be.calledWith({ item: bucketItemOriginal, filter: filterOriginal });
        });

        it('saves selected attribute elements', () => {
            const items = [
                fromJS({ uri: '/elements/one?id=1', title: 'Element One' }),
                fromJS({ uri: '/elements/two?id=2', title: 'Element Two' })
            ];

            const elements = createElements(items);

            const setBucketItemUpdateMetricFilter = sinon.spy();

            const filters = render({ bucketItem, elements, setBucketItemUpdateMetricFilter });

            const filterButton = findRenderedDOMComponentWithClass(filters, 's-filter-button');

            click(filterButton);

            const checkbox = document.querySelector('.s-id-2');

            click(checkbox);

            const button = document.querySelector('.s-apply');

            click(button);

            expect(setBucketItemUpdateMetricFilter).to.be.calledWith({
                item: bucketItemOriginal,
                filter: filterOriginal,
                changes: {
                    allElements: List(),
                    isInverted: true,
                    selectedElements: List([items[1]]),
                    totalElementsCount: 2
                }
            });
        });
    });

    describe('MetricAttributeFilter', () => {
        const bucketItem = createBucketItem();
        const items = [
            {
                attribute: {
                    content: { displayForms: [{ links: {}, meta: {} }] },
                    meta: {
                        identifier: 'attr.campaign_details.campaign_group',
                        title: 'Campaign Group'
                    }
                }
            }
        ];

        let server;

        function catalogResponse(_items, available, offset = 0) {
            return {
                catalogResponse: {
                    catalog: _items,
                    paging: { count: items.length, offset },
                    totals: { available }
                }
            };
        }

        beforeEach(() => {
            server = sinon.fakeServer.create({
                respondImmediately: true
            });
        });

        afterEach(() => {
            server.restore();
            document.body.innerHTML = '';
        });

        it('renders metric attribute filter if there are no filters in bucket item', () => {
            server.respondWith(JSON.stringify(catalogResponse(items, items.length, 0)));
            const filters = render({ bucketItem });

            findRenderedDOMComponentWithClass(filters, 's-metric-attribute-filter-button');
        });

        it('adds filter for given attribute on item click', done => {
            server.respondWith(JSON.stringify(catalogResponse(items, items.length, 50)));
            const setBucketItemAddMetricFilter = sinon.spy();

            const filters = render({ bucketItem, setBucketItemAddMetricFilter });

            const button = findRenderedDOMComponentWithClass(filters, 's-metric-attribute-filter-button');

            click(button);

            setTimeout(() => {
                const item = document.querySelector('.s-campaign_group');

                click(item);

                const args = setBucketItemAddMetricFilter.args[0];

                expect(args[0].item).to.eql(bucketItemOriginal);
                expect(args[0].attribute.get('id')).to.eql('attr.campaign_details.campaign_group');

                done();
            }, 0);
        });
    });
});

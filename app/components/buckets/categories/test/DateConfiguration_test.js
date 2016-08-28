import React from 'react';
import { DateConfiguration } from '../DateConfiguration';
import { fromJS } from 'immutable';
import withIntl from '../../../../utils/with_intl';
import { renderIntoDocumentWithUnmount } from 'goodstrap/packages/core/test/utils';
import {
    findRenderedDOMComponentWithClass,
    scryRenderedComponentsWithType,
    Simulate
} from 'react-addons-test-utils';

describe('DateConfiguration', () => {
    const original = Symbol('original');
    let configuration;

    const dateDataSets = fromJS([
        { identifier: 'coca.cola', attributeTitle: 'Coca-Cola', relevance: 0 },
        { identifier: 'zendesk', attributeTitle: 'Zendesk', relevance: 0 }
    ]);

    function render(userProps = {}) {
        const bucketItem = fromJS({
            original,
            dateDataSet: {
                identifier: 'zendesk',
                attributeTitle: 'Zendesk',
                attributes: [
                    { dateType: 'year', label: 'Year' },
                    { dateType: 'month', label: 'Month' }
                ]
            },
            granularity: {
                dateType: 'year',
                label: 'Year'
            }
        });

        const defaultProps = {
            bucketItem,
            dateDataSets: fromJS({
                items: dateDataSets,
                unavailable: 0,
                dateDataSet: dateDataSets.first()
            }),
            setBucketItemDateDataSet: sinon.spy(),
            setBucketItemGranularity: sinon.spy(),
            defaultDialogHeight: 200
        };

        const props = {
            ...defaultProps,
            ...userProps
        };


        const Wrapped = withIntl(DateConfiguration);
        return renderIntoDocumentWithUnmount(<Wrapped {...props} />);
    }

    afterEach(() => {
        configuration.unmount();

        // work-around to handle overlays
        document.body.innerHTML = '';
    });

    context('no date datasets available', () => {
        beforeEach(() => {
            configuration = render({ dateDataSets: fromJS({ items: [] }) });
        });

        function expectMissing(component, selector) {
            const found = scryRenderedComponentsWithType(component, selector);

            expect(found).to.have.length(0);
        }

        it('should render explanation if no datasets available', () => {
            findRenderedDOMComponentWithClass(configuration, 's-no-date-available');
        });

        it('should hide the date datasets select', () => {
            expectMissing(configuration, 's-date-dataset-switch');
        });

        it('should hide the granularity select', () => {
            expectMissing(configuration, 's-date-granularity-switch');
        });
    });

    it('should render list with date datasets', () => {
        const setBucketItemDateDataSet = sinon.spy();
        configuration = render({ setBucketItemDateDataSet });

        const dropdownButton = findRenderedDOMComponentWithClass(configuration, 's-date-dataset-button');
        Simulate.click(dropdownButton);

        const itemNodes = document.querySelectorAll('.gd-list-item');
        const items = Array.from(itemNodes);
        expect(items).to.have.length(2);

        expect(items.map(item => item.innerText)).to.eql(['Coca-Cola', 'Zendesk']);

        Simulate.click(itemNodes[0]);

        expect(setBucketItemDateDataSet).to.be.calledWith({
            item: original,
            value: dateDataSets.get(0),
            index: 0,
            relevance: 0
        });
    });

    it('should render list with granularity', () => {
        const setBucketItemGranularity = sinon.spy();
        configuration = render({ setBucketItemGranularity });

        const dropdownButton = findRenderedDOMComponentWithClass(configuration, 's-date-granularity-button');
        Simulate.click(dropdownButton);

        const itemNodes = document.querySelectorAll('.gd-list-item');
        const items = Array.from(itemNodes);
        expect(items).to.have.length(2);

        expect(items.map(item => item.innerText)).to.eql(['Year', 'Month']);

        Simulate.click(itemNodes[0]);

        expect(setBucketItemGranularity).to.be.calledWith({ item: original, value: 'year' });
    });
});

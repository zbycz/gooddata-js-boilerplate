import React from 'react';
import { fromJS } from 'immutable';
import DateFilterItem from '../DateFilterItem';
import { renderIntoDocument, findRenderedDOMComponentWithClass } from 'react-addons-test-utils';
import withIntl from '../../../utils/with_intl';

describe('DateFilterItem', () => {
    const dateDataSets = fromJS([
        { identifier: 'coca.cola', attributeTitle: 'Coca-Cola', relevance: 0 },
        { identifier: 'zendesk', attributeTitle: 'Zendesk', relevance: 0 }
    ]);

    const bucketItemWithoutDate = fromJS({
        dateDataSet: null,
        filters: [{}]
    });

    const bucketItemWithDate = bucketItemWithoutDate.set('dateDataSet', Symbol('foo'));

    function render(props) {
        const Wrapped = withIntl(DateFilterItem);

        return renderIntoDocument(<Wrapped {...props } />);
    }

    context('date dataset is empty', () => {
        it('should render explanation', () => {
            const component = render({
                bucketItem: bucketItemWithoutDate,
                dateDataSets: fromJS({ items: [] })
            });

            findRenderedDOMComponentWithClass(component, 's-no-date-available');
        });
    });

    context('date dataset is set', () => {
        it('should render filter dropdown', () => {
            const component = render({
                bucketItem: bucketItemWithDate,
                dateDataSets: fromJS({
                    items: dateDataSets,
                    dateDataSet: dateDataSets.first()
                })
            });

            findRenderedDOMComponentWithClass(component, 's-filter-button');
        });
    });
});

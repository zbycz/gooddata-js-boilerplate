import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { fromJS } from 'immutable';
import { noop } from 'lodash';

import CatalogueList from '../CatalogueList';
import NoData from '../CatalogueEmpty';
import List from 'List/ReactList';

import { projectDataLabel } from '../../../services/catalogue_service';
import withIntl from '../../../utils/with_intl';
import withRedux from '../../../utils/with_redux';
import withDnD from '../../../utils/with_drag_drop_context';

let { renderIntoDocument, findRenderedComponentWithType, findRenderedDOMComponentWithClass } = ReactTestUtils;


describe('Catalogue list', () => {
    const items = [
        fromJS({
            identifier: 'sample_header',
            isGroupHeader: true,
            type: 'header'
        }),
        fromJS({
            identifier: 'sample_date',
            title: 'Some title',
            type: 'date',
            isAvailable: true,
            summary: 'Some interesting summary'
        })
    ];
    const catalogueListProps = {
        data: {
            totalCount: 2,
            items,
            unavailableItemsCount: 0
        },
        meta: {
            query: {},
            offset: 0
        },
        getObjectAt(index) {
            return items[index];
        },
        isLoading: false,
        isLoadingAvailability: false,
        onShowBubble: noop
    };

    function render(props) {
        const Wrapped = withRedux(
            withDnD(
                withIntl(CatalogueList)
            )
        );

        return renderIntoDocument(
            <Wrapped {...props} />
        );
    }

    it('should render spinner when loading data', () => {
        const props = { ...catalogueListProps, isLoading: true };
        const component = render(props);
        findRenderedDOMComponentWithClass(component, 'gd-spinner');
    });

    it('should render CatalogueEmpty when there is no data', () => {
        const props = {
            ...catalogueListProps,
            data: {
                items: [],
                totalCount: 0,
                unavailableItemsCount: 0
            },
            meta: {
                query: {
                    filter: 'some filter'
                },
                offset: 0
            }
        };
        const component = render(props);

        findRenderedComponentWithType(component, NoData);
    });

    it('should show \'No objects found\' when there is no data and filter is empty', () => {
        const props = {
            ...catalogueListProps,
            data: {
                items: [projectDataLabel],
                totalCount: 1,
                unavailableItemsCount: 0
            },
            meta: {
                query: {
                    filter: ''
                },
                offset: 1
            }
        };
        const component = render(props);

        findRenderedDOMComponentWithClass(component, 'adi-no-objects');
    });

    it('should render list of items', () => {
        const component = render({ ...catalogueListProps });
        findRenderedComponentWithType(component, List);
    });

    it('should render note about unrelated items', () => {
        const props = {
            ...catalogueListProps,
            data: {
                items,
                totalCount: items.length,
                unavailableItemsCount: 5
            }
        };

        const component = render(props);

        findRenderedDOMComponentWithClass(component, 's-unavailable-items-matched');
    });
});

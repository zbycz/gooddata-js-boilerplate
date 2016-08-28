import { List, fromJS } from 'immutable';
import { range } from 'lodash';

import * as Actions from '../constants/Actions';
import * as StatePaths from '../constants/StatePaths';

import { INITIAL_MODEL, attributeElement } from '../models/attribute_element';

function getQuery({ attribute, filter }) {
    return fromJS({
        attribute,
        filter
    });
}

export function isElementRangeLoaded(state, { attribute, filter, start, end }) {
    const currentQuery = state.getIn(StatePaths.ATTRIBUTE_ELEMENTS_QUERY);
    const newQuery = getQuery({ attribute, filter });

    if (currentQuery.equals(newQuery)) {
        const items = state.getIn(StatePaths.ATTRIBUTE_ELEMENTS_ITEMS); // note: items is a sparse array
        const allLoaded = range(start, end).findIndex(idx => typeof items.get(idx) === 'undefined') === -1;

        if (allLoaded) {
            return true;
        }
    }

    return false;
}

function attributeElementsUpdate(state, { attribute, filter, start, end }) {
    const currentQuery = state.getIn(StatePaths.ATTRIBUTE_ELEMENTS_QUERY);
    const newQuery = getQuery({ attribute, filter });

    let newState = state;

    if (!currentQuery.equals(newQuery)) {
        // total count of whole unfiltered list
        // keep value if we filter the same attribute
        const isSameAttribute = currentQuery.get('attribute') === newQuery.get('attribute');
        const currentQueryData = isSameAttribute ? {
            initialItems: state.getIn(StatePaths.ATTRIBUTE_ELEMENTS_INITIAL_ITEMS),
            total: state.getIn(StatePaths.ATTRIBUTE_ELEMENTS_TOTAL)
        } : null;

        newState = state.setIn(StatePaths.ATTRIBUTE_ELEMENTS, fromJS({
            ...INITIAL_MODEL,
            ...currentQueryData,
            query: newQuery,
            isLoading: true
        }));
    }

    let newItems = newState.getIn(StatePaths.ATTRIBUTE_ELEMENTS_ITEMS);

    range(start, Math.min(end, newState.getIn(StatePaths.ATTRIBUTE_ELEMENTS_FILTERED_TOTAL)))
        .forEach(idx => {
            if (typeof newItems.get(idx) === 'undefined') {
                newItems = newItems.set(idx, null);
            }
        });

    return newState.setIn(StatePaths.ATTRIBUTE_ELEMENTS_ITEMS, newItems);
}

function attributeElementsUpdated(state, { attribute, filter, start, total, items }) {
    const currentQuery = state.getIn(StatePaths.ATTRIBUTE_ELEMENTS_QUERY);
    const newQuery = getQuery({ attribute, filter });

    if (currentQuery.equals(newQuery)) {
        let end = start + items.length;

        let newItems = state.getIn(StatePaths.ATTRIBUTE_ELEMENTS_ITEMS);
        range(start, end).forEach(idx => {
            newItems = newItems.set(idx, attributeElement(items[idx - start]));
        });

        let initialItems = state.getIn(StatePaths.ATTRIBUTE_ELEMENTS_INITIAL_ITEMS),
            oldTotal = state.getIn(StatePaths.ATTRIBUTE_ELEMENTS_TOTAL);

        return state
            .setIn(StatePaths.ATTRIBUTE_ELEMENTS_INITIAL_ITEMS,
                   initialItems || List(items).map(attributeElement))
            .setIn(StatePaths.ATTRIBUTE_ELEMENTS_ITEMS, newItems)
            .setIn(StatePaths.ATTRIBUTE_ELEMENTS_TOTAL, oldTotal || total)
            .setIn(StatePaths.ATTRIBUTE_ELEMENTS_LOADING, false)
            .setIn(StatePaths.ATTRIBUTE_ELEMENTS_FILTERED_TOTAL, total);
    }

    return state;
}

export default (state, action) => {
    switch (action.type) {
        case Actions.ATTRIBUTE_ELEMENTS_UPDATE:
            return attributeElementsUpdate(state, action.payload);

        case Actions.ATTRIBUTE_ELEMENTS_UPDATED:
            return attributeElementsUpdated(state, action.payload);

        default:
            return state;
    }
};

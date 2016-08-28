import { fromJS, List, Record } from 'immutable';

import { indexBy } from '../utils/immutable';
import { GRANULARITY_OPTIONS } from '../models/granularity';
import { extractDateDataSetTitle } from '../utils/date_datasets';

export const INITIAL_MODEL = fromJS({
    available: [],
    unavailable: 0,
    dateDataSet: null,
    loaded: false
});

const dateDataSetBase = {
    title: null,
    summary: null,
    identifier: null,
    uri: null,
    attributes: [],
    type: null,
    id: null,
    isAvailable: true,
    relevance: null
};

export function dateDataSet(props) {
    return fromJS({ ...dateDataSetBase, ...props });
}

const DecoratedDateDataSet = Record({
    ...dateDataSetBase,
    attributeTitle: null,
    isDisabled: null
});

export function decoratedDateDataSet(item) {
    let attributesById = indexBy(item.get('attributes'), 'dateType');

    return new DecoratedDateDataSet(
        item
            .set('attributeTitle', extractDateDataSetTitle(item.get('title')))
            .set('isDisabled', !item.get('isAvailable'))
            .set('attributes', List(GRANULARITY_OPTIONS.map(
                    option => {
                        let attribute = attributesById.get(option.dateType);
                        return attribute ? attribute.set('label', option.label) : null;
                    }
                )).filter(attribute => !!attribute)
            )
    );
}

const DecoratedDateDataSets = Record({
    items: List(),
    unavailable: null,
    dateDataSet: null
});

function getItems(item) {
    return item.get('available').map(decoratedDateDataSet);
}

function getDateDataSet(item) {
    return item.get('dateDataSet') ? decoratedDateDataSet(item.get('dateDataSet')) : null;
}

export function decoratedDateDataSets(dateDataSets) {
    return new DecoratedDateDataSets(dateDataSets.withMutations(mutable =>
        mutable
            .set('items', getItems(mutable))
            .set('dateDataSet', getDateDataSet(mutable))
    ));
}

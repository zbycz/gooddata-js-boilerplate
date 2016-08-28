import { Record, fromJS } from 'immutable';
import { t } from '../utils/translations';
import { shortenText } from '../utils/base';

const MAX_SHORTEN_LENGTH = 15;
const DEFAULT_TITLE = `(${t('empty_value')})`;

export const INITIAL_MODEL = {
    query: {
        attribute: null,
        filter: null
    },
    initialItems: null,
    items: {}, // simulate sparse array with Map
    total: 0,
    filteredTotal: 0,
    isLoading: false
};

const attributeElementBase = {
    uri: null,
    title: DEFAULT_TITLE
};

export function attributeElement(props) {
    return fromJS({ ...attributeElementBase, ...props });
}

const DecoratedAttributeElement = Record({
    ...attributeElementBase,
    original: null,
    id: null,
    shortTitle: null,
    available: true
});

export function getId(element) {
    const match = (element.get('uri') || '').match(/\?id=(.*)/);
    return match && parseInt(match[1], 10);
}

export function getTitle(element) {
    return element.get('title') || DEFAULT_TITLE;
}

function getShortTitle(element) {
    return shortenText(element.get('title'), { maxLength: MAX_SHORTEN_LENGTH - 3 });
}

function isAvailable(element) {
    return element.get('available') !== false;
}

export function decoratedAttributeElement(element) {
    return new DecoratedAttributeElement(element && element.withMutations(mutable =>
        mutable
            .set('original', element)
            .set('id', getId(mutable))
            .set('title', getTitle(mutable))
            .set('shortTitle', getShortTitle(mutable))
            .set('available', isAvailable(mutable))
    ));
}

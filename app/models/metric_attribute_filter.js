import { Record, Map, fromJS } from 'immutable';
import { compact, union } from 'lodash';

import { t } from '../utils/translations';
import { indexBy } from '../utils/immutable';
import { shortenText } from '../utils/base';

import { decoratedAttributeElement } from './attribute_element';
import { createDateItem, DATE_DATASET_ATTRIBUTE } from './date_item';
import { decoratedPresetItem, PRESETS } from './preset_item';

const MAX_TITLE_LENGTH = 255;
const MAX_INVERTED_EXAMPLES = 50;
const SAMPLE_DELIMITER = ', ';
const MAX_FILTER_ATTRIBUTES = 3;


let metricAttributeFilterBase = {
    attribute: null,
    allElements: [],
    selectedElements: [],
    isInverted: true,
    totalElementsCount: 0,
    interval: null,
    isModified: false
};

export function metricAttributeFilter(props) {
    return fromJS({ ...metricAttributeFilterBase, ...props });
}

function elementUris(elements) {
    return elements.map(element => element.get('uri')).toArray();
}

class DecoratedMetricAttributeFilter extends Record({
    ...metricAttributeFilterBase,
    original: null,
    expression: '',
    title: '',
    ellipsedTitle: '',
    allSelected: true,
    selectionSize: 0,
    dateDataSet: null
}) {
    selectionEquals(selectedElements, isInverted) {
        let thisUris = elementUris(this.selectedElements),
            checkUris = elementUris(selectedElements);

        return (thisUris.length === checkUris.length) &&
            (this.isInverted === isInverted) &&
            (union(thisUris, checkUris).length === thisUris.length);
    }
}

function getAttribute(filter, itemCache) {
    const attribute = filter.get('attribute');
    if (attribute === DATE_DATASET_ATTRIBUTE) {
        return createDateItem();
    }

    return itemCache.get(attribute);
}

function getSelectedElements(filter) {
    return filter.get('selectedElements').map(decoratedAttributeElement);
}

// Not all elements in filter must be available after load.
// We ignore them on UI but must preserve them in model and when
// updating visualization object.
// We set "available" attribute in metadata.js "processAttributeFilter" method
function getAvailableElements(filter) {
    return getSelectedElements(filter)
        .filter(el => el.get('available'));
}

function getExpression(filter) {
    let attribute = filter.get('attribute'),
        selectedElements = filter.get('selectedElements');

    if (!attribute || !selectedElements.size) return null;

    let identifier = filter.getIn(['attribute', 'id']),
        elementsMaql = selectedElements.map(element => `[${element.get('uri')}]`).sortBy().join(', '),
        operator = filter.get('isInverted') ? 'NOT IN' : 'IN';

    return `{${identifier}} ${operator} (${elementsMaql})`;
}

function getSelectionSize(filter) {
    if (filter.get('isInverted')) {
        return filter.get('totalElementsCount') - getAvailableElements(filter).size;
    }

    return getAvailableElements(filter).size;
}

function getAllSelected(filter) {
    return filter.get('totalElementsCount') === filter.get('selectionSize');
}

function getSampleElements(filter) {
    let sampleElements = getAvailableElements(filter);

    if (filter.get('isInverted')) {
        let selectionMap = indexBy(sampleElements, 'uri');

        sampleElements = filter.get('allElements')
            .filter(element => !selectionMap.get(element.get('uri')))
            .take(MAX_INVERTED_EXAMPLES)
            .map(decoratedAttributeElement);
    }

    return sampleElements
        .map(element => element.get('title'))
        .toArray();
}

function getSelectionSample(filter, maxChars, N) {
    const sampleItems = getSampleElements(filter);
    const sample = compact(N ? sampleItems.slice(0, N) : sampleItems).join(SAMPLE_DELIMITER);

    if (sample.length > maxChars) {
        return shortenText(sample, { maxLength: maxChars - 2 });
    }

    return sample;
}

function isNotDate(filter) {
    return !!(filter.getIn(['attribute', 'type']) !== 'date');
}

function getDateDataSet(filter, dateDataSets) {
    if (isNotDate(filter)) {
        return null;
    }

    return dateDataSets.get('dateDataSet');
}

function getInterval(filter) {
    if (isNotDate(filter)) {
        return null;
    }
    return decoratedPresetItem(filter.get('interval') || PRESETS.get('0'));
}

function getTitlePrefix(filter) {
    if (isNotDate(filter)) {
        return filter.getIn(['attribute', 'title']);
    }
    return filter.getIn(['dateDataSet', 'attributeTitle']);
}

function getTitlePostfix(filter) {
    if (isNotDate(filter)) {
        if (filter.get('allSelected')) {
            return `: ${t('all')}`;
        }

        return ` (${getSelectionSize(filter)})`;
    }
    return `: ${filter.get('interval').getTitle()}`;
}

function getTitle(filter) {
    // variants:
    // metric_name (filter_name: argument, argument, argument)
    // metric_name: filter_name (argsCnt)
    // metric_name: All

    if (isNotDate(filter) &&
            !filter.get('allSelected')) {
        const titlePrefix = `${getTitlePrefix(filter)}`;

        if (getSelectionSize(filter) <= MAX_FILTER_ATTRIBUTES) {
            return ` (${titlePrefix}: ${getSelectionSample(filter, MAX_TITLE_LENGTH - titlePrefix.length, MAX_FILTER_ATTRIBUTES)})`;
        }
        return `: ${getTitlePrefix(filter)}${getTitlePostfix(filter)}`;
    }

    return `${getTitlePrefix(filter)}${getTitlePostfix(filter)}`;
}

function getEllipsedTitle(filter) {
    const prefix = getTitlePrefix(filter);

    if (isNotDate(filter) &&
            !filter.get('allSelected')) {
        const info = getSelectionSample(filter, MAX_TITLE_LENGTH - prefix.length);
        return `${prefix}: ${info}`;
    }

    return `${prefix}${getTitlePostfix(filter)}`;
}

export function isModified(filter) {
    return !!filter.get('isModified');
}

export function decoratedMetricAttributeFilter(filter = metricAttributeFilter(), itemCache = Map(), dateDataSets = Map()) {
    return new DecoratedMetricAttributeFilter(filter.withMutations(mutable =>
        mutable
            .set('original', filter)
            .set('isModified', isModified(mutable)) // order of mutations is important!
            .set('attribute', getAttribute(mutable, itemCache))
            .set('selectedElements', getSelectedElements(mutable))
            .set('expression', getExpression(mutable))
            .set('selectionSize', getSelectionSize(mutable))
            .set('allSelected', getAllSelected(mutable))
            .set('dateDataSet', getDateDataSet(mutable, dateDataSets))
            .set('interval', getInterval(mutable))
            .set('title', getTitle(mutable))
            .set('ellipsedTitle', getEllipsedTitle(mutable))
    ));
}

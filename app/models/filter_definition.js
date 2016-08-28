function getAttributeFilterDefinition(filter) {
    const filterElements = filter.get('selectedElements')
        .map(el => (el.id && { id: el.id }))
        .filter(x => !!x)
        .toArray();

    if (!filterElements.length) {
        return null;
    }

    return filter.get('isInverted') ? { '$not': { '$in': filterElements } } : { '$in': filterElements };
}

function getDateFilterDefinition(filter) {
    let interval = filter.getIn(['interval', 'interval']);
    return (interval ? {
        '$between': interval.toArray()
    } : null);
}

export function getConditionDefinition(filter) {
    return (filter.getIn(['attribute', 'type']) === 'date'
        ? getDateFilterDefinition(filter)
        : getAttributeFilterDefinition(filter));
}

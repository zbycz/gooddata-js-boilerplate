import { head, pick } from 'lodash';

const BASIC_PROPS = ['title', 'summary', 'identifier', 'uri'];

function pickBasicProps(item) {
    return pick(item.meta, BASIC_PROPS);
}

function deserializeFact(fact) {
    return pickBasicProps(fact);
}

function deserializeMetric(metric) {
    let basicProps = pickBasicProps(metric);
    let metricProps = pick(metric.content, ['expression', 'format']);

    return Object.assign({}, basicProps, metricProps);
}

function deserializeDateAttribute(attribute) {
    let basicProps = pickBasicProps(attribute);
    let displayForm = attribute.defaultDisplayFormMeta;
    let attributeProps = {
        granularity: attribute.attributeMeta.identifier,
        dfIdentifier: displayForm.identifier,
        dfUri: displayForm.uri,
        dateType: attribute.type,
        uri: attribute.attributeMeta.uri
    };

    return { ...basicProps, ...attributeProps };
}

function deserializeAttribute(attribute) {
    let basicProps = pickBasicProps(attribute);
    let displayForm = head(attribute.content.displayForms);
    let attributeProps = {
        dimensionUri: attribute.content.dimension,
        granularity: attribute.meta.identifier,
        elementsUri: displayForm.links.elements,
        dfIdentifier: displayForm.meta.identifier,
        dfUri: displayForm.meta.uri,
        dateType: attribute.content.type
    };

    return { ...basicProps, ...attributeProps };
}

function deserializeDateDataSet(dateDataSet) {
    const basicProps = pickBasicProps(dateDataSet);

    const dateDataSetProps = {
        attributes: dateDataSet.availableDateAttributes.map(deserializeDateAttribute),
        relevance: dateDataSet.relevance
    };

    return { ...basicProps, ...dateDataSetProps };
}

const DESERIALIZERS = {
    fact: deserializeFact,
    metric: deserializeMetric,
    attribute: deserializeAttribute,
    dateDataSet: deserializeDateDataSet
};

function deserializeItem(item) {
    let type = head(Object.keys(item));
    let props = DESERIALIZERS[type](item[type]);

    return {
        ...props,
        type,
        id: props.identifier,
        isAvailable: true
    };
}

export default function deserializeItems(items) {
    return items.map(deserializeItem);
}

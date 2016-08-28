// Copyright (C) 2007-2016, GoodData(R) Corporation. All rights reserved.
import _ from 'lodash';
import sdk from 'gooddata';

import loadMetricMaql from './metric_details_loader';

const ELEMENT_COUNT = 5;

function loadAttrElements(attribute) {
    const elementsUri = `${attribute.elementsUri}?offset=0&count=${ELEMENT_COUNT}`;

    return sdk.xhr.ajax(elementsUri).then(res => res.attributeElements);
}

function loadDataset(item, pid) {
    const objectId = _.last(item.uri.split('/')),
        uri = `/gdc/md/${pid}/usedby2/${objectId}?types=dataSet`;

    return sdk.xhr.ajax(uri).then(data => _.first(data.entries));
}

const detailLoaders = {
    metric(item) {
        const promise = loadMetricMaql(item);
        return promise.then(segments => ({ metricMaql: segments }));
    },

    attribute(item) {
        const promise = loadAttrElements(item);
        return promise.then(attributeElements => {
            const attrElementsTotalCount = parseInt(attributeElements.elementsMeta.records, 10);

            return {
                attrElements: attributeElements.elements,
                attrElementsTotalCount
            };
        });
    },

    fact(item, pid) {
        const promise = loadDataset(item, pid);
        return promise.then(dataset => ({ dataset }));
    }
};

function defaultLoader() {
    return Promise.resolve();
}

export function loadDetails(item, pid) {
    const detailLoader = detailLoaders[item.type] || defaultLoader;

    return detailLoader(item, pid);
}

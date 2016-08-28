import { extractDateDataSetTitle } from '../utils/date_datasets';
import sdk from 'gooddata';
import { wrapPromise } from '../utils/promises';
import { t } from '../utils/translations';
import { includes, flow, get } from 'lodash';
import { delayGenerator } from '../utils/generators';

const SHORT_DELAYS = 25;
const EMPTY_RESULT = null;
const EMPTY_VALUE = `(${t('empty_value')})`;

function replaceEmptyMetricFormat(data) {
    data.headers.forEach(header => {
        if (!header.format && header.type === 'metric') {
            // default number format defaultNumberFormat
            header.format = '#,##0.00';
        }
    });

    return data;
}

function replaceEmptyAttributeValues(data) {
    let attributeIndexes = data.headers.reduce((arr, header) => {
        if (header.type === 'attrLabel') {
            arr.push(data.headers.indexOf(header));
        }

        return arr;
    }, []);


    data.rawData.forEach(row => {
        attributeIndexes.forEach(index => {
            row[index] = row[index] || EMPTY_VALUE;
        });
    });

    return data;
}

function replaceIsLoaded(data) {
    data.isLoading = !data.isLoaded;
    return data;
}

const formatExecutedReport = flow(
    replaceEmptyMetricFormat,
    replaceEmptyAttributeValues,
    replaceIsLoaded
);

export function execute(report) {
    if (report.isEmpty()) {
        return Promise.resolve(EMPTY_RESULT);
    }

    const { projectId, mdObject } = report;
    const delay = delayGenerator(SHORT_DELAYS);

    const $promise = sdk.execution.getDataForVis(projectId, mdObject, {
        pollDelay: () => delay.next().value
    });

    return wrapPromise($promise)
        .then(formatExecutedReport);
}

export function replaceDateDataSetTitle(data, identifiers) {
    get(data, 'headers', []).forEach(header => {
        // Strips "created_at.xyz" down to "created_at"
        let id = header.id.split('.')[0];

        if (includes(identifiers, id)) {
            header.title = extractDateDataSetTitle(header.title);
        }
    });

    return data;
}

/* eslint no-param-reassign: 0 */

import _ from 'lodash';
import sdk from 'gooddata';
import { t } from '../utils/translations';

const EMPTY_VALUE = t('empty_value');
const PARENS = _.escapeRegExp('{}[]"');

const RE_TOKENS = {
    text: new RegExp(`^[^${PARENS}]+`),
    quoted_text: new RegExp('^"(?:[^"\\\\]|\\\\.)*"'),
    identifier: /^\{.*?\}/,
    uri: /^\[.*?\]/
};

function tokenizeExpression(expr) {
    let tokens = [];

    while (expr.length) {
        let match;

        for (let type of Object.keys(RE_TOKENS)) {
            let re = RE_TOKENS[type];
            match = expr.match(re);

            if (match) {
                let [value] = match;
                tokens.push({ type, value });
                expr = expr.substr(value.length);
                break;
            }
        }

        if (!match) {
            throw new Error(`Unable to match token, rest of output is: "${expr}"`);
        }
    }

    return tokens;
}

function fetchMetadataTitle(uri) {
    return sdk.xhr.ajax(uri).then(res => {
        const meta = _.first(_.values(res)).meta;

        return _.pick(meta, ['title', 'category']);
    });
}

function fetchAttrElementTitle(uri) {
    const uriChunks = uri.match(/(.+)\/elements\?id=(.*)/),
        attrUri = uriChunks[1],
        elementIds = uriChunks[2];

    return sdk.xhr.ajax(attrUri)
        .then(attrRes => {
            const elementsLink = attrRes.attribute.content.displayForms[0].links.elements;
            return sdk.xhr.ajax(`${elementsLink}?id=${elementIds}`);
        })
        .then(attrElementsRes => ({
            title: attrElementsRes.attributeElements.elements[0].title || `(${EMPTY_VALUE})`,
            category: 'attribute_element'
        }));
}

function fetchTitle(uri) {
    if (_.includes(uri, '/elements?id=')) {
        return fetchAttrElementTitle(uri);
    }

    return fetchMetadataTitle(uri);
}

function fetchTokenTitles(tokens) {
    let cachedTitleFetcher = _.memoize(fetchTitle);

    const fetchedTokens = tokens.map(token => {
        let { type, value } = token;

        if (type === 'uri') {
            let uri = _.trim(value, '[]');
            return cachedTitleFetcher(uri);
        }

        if (type === 'text' || type === 'quoted_text') {
            return { title: value };
        }

        return { title: value, category: type };
    });

    return Promise.all(fetchedTokens);
}

export default function loadMetricMaql(metric) {
    const maql = metric.expression;
    const tokens = tokenizeExpression(maql);
    return fetchTokenTitles(tokens);
}

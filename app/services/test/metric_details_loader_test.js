import metricLoader from '../metric_details_loader';
import sdk from 'gooddata';

describe('Metric details loader', () => {
    let factUri = '/gdc/md/project/obj/1';
    let attributeUri = '/gdc/md/project/obj/2';
    let displayFormUri = '/gdc/md/project/obj/3';
    let elementUri = `${attributeUri}/elements?id=1`;
    let elementDisplayFormUri = `${displayFormUri}/elements?id=1`;

    let factTitle = 'Fact title';
    let attributeTitle = 'Attribute title';
    let displayFormTitle = 'DisplayForm title';
    let elementTitle = 'Element title';

    let factResponse = {
        fact: {
            content: {},
            meta: {
                uri: factUri,
                title: factTitle,
                category: 'fact'
            }
        }
    };

    let displayFormContent = {
        links: {
            elements: `${displayFormUri}/elements`
        },
        meta: {
            uri: displayFormUri,
            title: displayFormTitle,
            category: 'attributeDisplayForm'
        }
    };

    let displayFormResponse = {
        attributeDisplayForm: displayFormContent
    };

    let attributeResponse = {
        attribute: {
            content: {
                displayForms: [
                    displayFormContent
                ]
            },
            meta: {
                uri: attributeUri,
                title: attributeTitle,
                category: 'attribute'
            }
        }
    };

    let elementResponse = {
        attributeElements: {
            elements: [
                {
                    title: elementTitle,
                    uri: elementDisplayFormUri
                }
            ],
            elementsMeta: {
                attribute: attributeUri,
                attributeDisplayForm: displayFormUri
            }
        }
    };

    let sandbox;
    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('properly translates objects in MAQL', () => {
        sandbox.stub(sdk.xhr, 'ajax', uri => {
            if (uri === factUri) return Promise.resolve(factResponse);
            if (uri === attributeUri) return Promise.resolve(attributeResponse);
            if (uri === elementDisplayFormUri) return Promise.resolve(elementResponse);

            return null;
        });

        let expression = `SELECT SUM([${factUri}]) WHERE [${attributeUri}]=[${elementUri}]`;
        let loaderPromise = metricLoader({ expression });

        return loaderPromise.then(result => {
            expect(result).to.eql([
                { title: 'SELECT SUM(' },
                { title: factTitle, category: 'fact' },
                { title: ') WHERE ' },
                { title: attributeTitle, category: 'attribute' },
                { title: '=' },
                { title: elementTitle, 'category': 'attribute_element' }
            ]);
        });
    });

    it('recognizes identifiers in MAQL', () => {
        sandbox.stub(sdk.xhr, 'ajax', uri => {
            if (uri === attributeUri) return Promise.resolve(attributeResponse);
            if (uri === elementDisplayFormUri) return Promise.resolve(elementResponse);

            return null;
        });

        let expression = `SELECT SUM({identifier1}) WHERE {identifier2} IN ([${elementUri}])`;
        let loaderPromise = metricLoader({ expression });

        return loaderPromise.then(result => {
            expect(result).to.eql([
                { title: 'SELECT SUM(' },
                { title: '{identifier1}', category: 'identifier' },
                { title: ') WHERE ' },
                { title: '{identifier2}', category: 'identifier' },
                { title: ' IN (' },
                { title: elementTitle, category: 'attribute_element' },
                { title: ')' }
            ]);
        });
    });

    it('handlers quoted text in MAQL', () => {
        sandbox.stub(sdk.xhr, 'ajax', uri => {
            if (uri === displayFormUri) return Promise.resolve(displayFormResponse);
            if (uri === attributeUri) return Promise.resolve(attributeResponse);

            return null;
        });

        let expression = `SELECT SUM(1) WHERE [${displayFormUri}] LIKE "%keyword%"`;
        let loaderPromise = metricLoader({ expression });

        return loaderPromise.then(result => {
            expect(result).to.eql([
                { title: 'SELECT SUM(1) WHERE ' },
                { title: displayFormTitle, category: 'attributeDisplayForm' },
                { title: ' LIKE ' },
                { title: '"%keyword%"' }
            ]);
        });
    });

    it('does not translate object in quoted text', () => {
        sandbox.stub(sdk.xhr, 'ajax', uri => {
            if (uri === displayFormUri) return Promise.resolve(displayFormResponse);
            if (uri === attributeUri) return Promise.resolve(attributeResponse);

            return null;
        });

        let expression = `SELECT SUM(1) WHERE [${displayFormUri}] LIKE "[${elementUri}]"`;
        let loaderPromise = metricLoader({ expression });

        return loaderPromise.then(result => {
            expect(result).to.eql([
                { title: 'SELECT SUM(1) WHERE ' },
                { title: displayFormTitle, category: 'attributeDisplayForm' },
                { title: ' LIKE ' },
                { title: `"[${elementUri}]"` }
            ]);
        });
    });


    it('handles escape quote in text', () => {
        let expression = 'SELECT SUM(1) WHERE {identifier} LIKE "word1 \\" word2"';
        let loaderPromise = metricLoader({ expression });

        return loaderPromise.then(result => {
            expect(result).to.eql([
                { title: 'SELECT SUM(1) WHERE ' },
                { title: '{identifier}', category: 'identifier' },
                { title: ' LIKE ' },
                { title: '"word1 \\" word2"' }
            ]);
        });
    });
});

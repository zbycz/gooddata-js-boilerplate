import { fromJS, Map } from 'immutable';

import { metricAttributeFilter, decoratedMetricAttributeFilter } from '../metric_attribute_filter';
import { DATE_DATASET_ATTRIBUTE } from '../date_item';

describe('Metric Attribute Filter', () => {
    let itemCache, elements, unavailableElement, filter, dateDataSets, decorated;

    function getDecorated(_filter) {
        return decoratedMetricAttributeFilter(_filter, itemCache, dateDataSets);
    }

    beforeEach(() => {
        itemCache = fromJS({
            'attr.account_details.retail_company': {
                dateType: undefined,
                dfIdentifier: 'label.account_details.retail_company',
                dfUri: '/gdc/md/TeamOneGoodSales1/obj/15366',
                dimensionUri: '/gdc/md/TeamOneGoodSales1/obj/15125',
                elementsUri: '/gdc/md/TeamOneGoodSales1/obj/15366/elements',
                granularity: 'attr.account_details.retail_company',
                id: 'attr.account_details.retail_company',
                identifier: 'attr.account_details.retail_company',
                isAvailable: true,
                summary: '',
                title: 'Account ID',
                type: 'attribute',
                uri: '/gdc/md/TeamOneGoodSales1/obj/15365'
            },
            'fact.spend_analysis.cart_additions': {
                id: 'fact.spend_analysis.cart_additions',
                identifier: 'fact.spend_analysis.cart_additions',
                isAvailable: true,
                summary: '',
                title: 'Cart Additions',
                type: 'fact',
                uri: '/gdc/md/TeamOneGoodSales1/obj/15418'
            },
            'aaeFKXFYiCc0': {
                expression: 'SELECT SUM([/gdc/md/TeamOneGoodSales1/obj/15417])',
                format: '[>=1000000000]$#,,,.0 B;[<=-1000000000]-$#,,,.0 B;[>=1000000]$#,,.0 M;[<=-1000000]-$#,,.0 M;[>=1000]$#,.0 K;[<=-1000]-$#,.0 K;$#,##0',
                id: 'aaeFKXFYiCc0',
                identifier: 'aaeFKXFYiCc0',
                isAvailable: true,
                summary: '',
                title: 'Awareness',
                type: 'metric',
                uri: '/gdc/md/TeamOneGoodSales1/obj/16212'
            }
        });

        elements = fromJS([
            { uri: '/1?id=1', title: '1 element 1' },
            { uri: '/2?id=2', title: '2 element 2' },
            { uri: '/3?id=3', title: '3 element 3' },
            // a'la backend sorting 40 before 4<space>
            { uri: '/4?id=4', title: '40element 4' },
            { uri: '/5?id=5', title: '4 element 5' }
        ]);

        unavailableElement = {
            uri: '/6?id=666',
            available: false
        };

        dateDataSets = fromJS({
            items: [],
            dateDataSet: 'abc'
        });
    });

    describe('basic tests', () => {
        beforeEach(() => {
            filter = metricAttributeFilter({
                attribute: 'aaeFKXFYiCc0',
                selectedElements: [elements.get(0), elements.get(2), unavailableElement],
                isInverted: false,
                totalElementsCount: 3,
                allElements: elements,
                isModified: false
            });
            decorated = getDecorated(filter);
        });

        describe('decorated item', () => {
            it('should point to original object', () => {
                expect(decorated.get('original')).to.equal(filter);
            });

            it('attribute should be set to catalogue item', () => {
                let attribute = decorated.get('attribute');
                expect(attribute).to.equal(itemCache.get(attribute.get('id')));
            });

            describe('expression', () => {
                it('should be generated correctly depending on selected elements', () => {
                    expect(decorated.get('expression')).to.equal('{aaeFKXFYiCc0} IN ([/1?id=1], [/3?id=3], [/6?id=666])');
                });

                it('should be generated correctly depending on inverted state', () => {
                    filter = filter.set('isInverted', true);
                    decorated = getDecorated(filter);

                    expect(decorated.get('expression')).to.equal('{aaeFKXFYiCc0} NOT IN ([/1?id=1], [/3?id=3], [/6?id=666])');
                });
            });

            describe('selectedElements', () => {
                it('should generate selected elements', () => {
                    let selectedElements = decorated.get('selectedElements');
                    expect(selectedElements.size).to.equal(3);
                    expect(selectedElements.getIn([0, 'uri'])).to.equal('/1?id=1');
                    expect(selectedElements.getIn([1, 'uri'])).to.equal('/3?id=3');
                    expect(selectedElements.getIn([2, 'uri'])).to.equal('/6?id=666');
                    expect(selectedElements.getIn([0, 'id'])).to.equal(1);
                    expect(selectedElements.getIn([1, 'id'])).to.equal(3);
                    expect(selectedElements.getIn([2, 'id'])).to.equal(666);
                });
            });

            describe('selectionSize', () => {
                it('should set selection size correctly', () => {
                    expect(decorated.get('selectionSize')).to.equal(2);

                    filter = filter.set('isInverted', true);
                    decorated = getDecorated(filter);

                    expect(decorated.get('selectionSize')).to.equal(1);
                });
            });

            describe('allSelected', () => {
                it('should be set correctly', () => {
                    expect(decorated.get('allSelected')).to.equal(false);

                    filter = filter.set('totalElementsCount', 2);
                    decorated = getDecorated(filter);

                    expect(decorated.get('allSelected')).to.equal(true);

                    filter = filter.set('isInverted', true);
                    decorated = getDecorated(filter);

                    expect(decorated.get('allSelected')).to.equal(false);
                });
            });

            describe('title', () => {
                it('should set correctly when all selected', () => {
                    filter = filter.set('totalElementsCount', 2);

                    decorated = getDecorated(filter);

                    expect(decorated.get('title')).to.equal('Awareness: All');
                });

                it('should set correctly when some elements are selected', () => {
                    expect(decorated.get('title')).to.equal(' (Awareness: 1 element 1, 3 element 3)');
                });

                it('should set correctly when element has no name', () => {
                    filter = filter
                        .set('selectedElements', fromJS([{ uri: '/1?id=1', title: '' }]));

                    decorated = getDecorated(filter);

                    expect(decorated.get('title')).to.equal(' (Awareness: (empty value))');
                });

                it('should set correctly with inverse selection', () => {
                    filter = filter.set('isInverted', true);
                    decorated = getDecorated(filter);

                    expect(decorated.get('title')).to.equal(' (Awareness: 2 element 2, 40element 4, 4 element 5)');
                });

                it('should set correctly with inverse selection when element has no name', () => {
                    filter = filter
                        .set('isInverted', true)
                        .set('allElements', fromJS([
                            { uri: '/1?id=1', title: '' },
                            { uri: '/2?id=2', title: '2 element 2' }
                        ]))
                        .set('selectedElements', fromJS([{ uri: '/2?id=2', title: '2 element 2' }]));

                    decorated = getDecorated(filter);

                    expect(decorated.get('title')).to.equal(' (Awareness: (empty value))');
                });

                it('should set correctly with not all elements available, but some selected and inverted', () => {
                    filter = metricAttributeFilter({
                        attribute: 'aaeFKXFYiCc0',
                        selectedElements: [elements.get(0), elements.get(2)],
                        isInverted: true,
                        totalElementsCount: 700200,
                        allElements: elements,
                        isModified: false
                    });
                    decorated = getDecorated(filter);

                    expect(decorated.get('title')).to.equal(': Awareness (700198)');
                });
            });

            describe('selectionEquals', () => {
                it('should be true when selection is the same', () => {
                    expect(decorated.selectionEquals(fromJS([{ uri: '/1?id=1' }, { uri: '/3?id=3' }, { uri: '/6?id=666' }]), false)).to.equal(true);
                });

                it('should be false when selection is different', () => {
                    expect(decorated.selectionEquals(fromJS([{ uri: '/1?id=1' }, { uri: '/2?id=2' }, { uri: '/6?id=666' }]), false)).to.equal(false);
                    expect(decorated.selectionEquals(fromJS([{ uri: '/1?id=1' }]), false)).to.equal(false);
                    expect(decorated.selectionEquals(fromJS([{ uri: '/1?id=1' }, { uri: '/3?id=3' }, { uri: '/6?id=666' }]), true)).to.equal(false);
                });
            });

            describe('date dataset', () => {
                beforeEach(() => {
                    filter = filter.set('attribute', DATE_DATASET_ATTRIBUTE);
                    decorated = getDecorated(filter);
                });

                it('should be set to globally selected date dataset', () => {
                    expect(decorated.get('dateDataSet')).to.equal('abc');
                });
            });

            describe('isModified', () => {
                it('should be set to true', () => {
                    filter = filter.set('isModified', true);
                    decorated = getDecorated(filter);

                    expect(decorated.get('isModified')).to.equal(true);
                });

                it('should be set to false', () => {
                    decorated = getDecorated(filter);

                    expect(decorated.get('isModified')).to.equal(false);
                });
            });
        });
    });
});

describe('date filter title', () => {
    let elements, filter, dateDataSets, decorated;

    dateDataSets = fromJS({
        dateDataSet: {
            attributeTitle: 'Date'
        }
    });

    function getDecoratedMetAFilter(_filter) {
        return decoratedMetricAttributeFilter(_filter, Map(), dateDataSets);
    }

    it('should be in right format', () => {
        filter = metricAttributeFilter({
            attribute: DATE_DATASET_ATTRIBUTE,
            selectedElements: [],
            isInverted: true,
            totalElementsCount: 0,
            selectionSize: 0,
            allElements: elements,
            isModified: false,
            interval: {
                isStatic: false,
                name: 'all_time'
            }
        });

        decorated = getDecoratedMetAFilter(filter);

        expect(decorated.get('title')).to.equal('Date: All time');
    });
});

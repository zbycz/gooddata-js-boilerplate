import { METRICS, CATEGORIES, FILTERS, STACKS } from '../../../constants/bucket';
import { DATE_DATASET_ATTRIBUTE } from '../../../models/date_item';

const elements = [
    {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168279',
        title: 'CompuSci'
    },
    {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168282',
        title: 'Educationly'
    },
    {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=169655',
        title: 'Explorer'
    },
    {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168284',
        title: 'Grammar Plus'
    },
    {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=964771',
        title: 'PhoenixSoft'
    },
    {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=169656',
        title: 'TouchAll'
    },
    {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=965523',
        title: 'WonderKid'
    }
];

export const appData = {
    itemCache: {
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
        },
        'attr.product.id': {
            dimensionUri: '/gdc/md/TeamOneGoodSales1/obj/948',
            summary: '',
            identifier: 'attr.product.id',
            dfUri: '/gdc/md/TeamOneGoodSales1/obj/952',
            dfIdentifier: 'label.product.id.name',
            uri: '/gdc/md/TeamOneGoodSales1/obj/949',
            granularity: 'attr.product.id',
            elementsUri: '/gdc/md/TeamOneGoodSales1/obj/952/elements',
            dataset: null,
            title: 'Product',
            type: 'attribute',
            id: 'attr.product.id',
            isAvailable: true
        }
    },
    attributeElements: {
    },
    catalogue: {
        items: ['fact.spend_analysis.cart_additions', 'aaeFKXFYiCc0', 'attr.product.id']
    },
    dateDataSets: {
        available: [{
            attributes: [{
                dimensionUri: '/gdc/md/TeamOneGoodSales1/obj/15174',
                summary: 'Year',
                dateType: 'GDC.time.year',
                identifier: 'activity.year',
                dfUri: '/gdc/md/TeamOneGoodSales1/obj/702',
                dfIdentifier: 'date.dim_date',
                uri: '/gdc/md/TeamOneGoodSales1/obj/701',
                granularity: 'activity.year',
                elementsUri: '/gdc/md/TeamOneGoodSales1/obj/702/elements',
                title: 'Year (Activity)'
            }, {
                dimensionUri: '/gdc/md/TeamOneGoodSales1/obj/15174',
                summary: 'Week/Year based on EU Weeks (Mon-Sun). By default, if a week spans multiple years or quarters (ie, end of the year/quarter), it is marked as first or last week of the period according to particular standards (ie, US or EU). Labels marked as \'Continuous\' show both weeks (W53/2009 - W1/2010).',
                dateType: 'GDC.time.week_us',
                identifier: 'activity.euweek',
                dfUri: '/gdc/md/TeamOneGoodSales1/obj/629',
                dfIdentifier: 'date.dim_date',
                uri: '/gdc/md/TeamOneGoodSales1/obj/624',
                granularity: 'activity.euweek',
                elementsUri: '/gdc/md/TeamOneGoodSales1/obj/629/elements',
                title: 'Week (Sun-Sat)/Year (Activity)'
            }],
            id: 'date.dim_date',
            identifier: 'date.dim_date',
            isAvailable: true,
            summary: 'Date dimension (Date)',
            title: 'Date dimension (Date)',
            type: 'dimension',
            uri: '/gdc/md/TeamOneGoodSales1/obj/15174'
        }],
        unavailable: 1,
        dateDataSet: 'date.dim_date'
    },
    visualizationType: 'bar',
    buckets: {
        [METRICS]: {
            keyName: METRICS,
            items: [{
                collapsed: true,
                attribute: 'fact.spend_analysis.cart_additions',
                filters: [],
                showInPercent: true
            }, {
                collapsed: true,
                attribute: 'aaeFKXFYiCc0',
                showPoP: true,
                filters: [
                    {
                        attribute: 'attr.product.id',
                        allElements: elements,
                        selectedElements: [elements[1], elements[3]],
                        isInverted: false,
                        totalElementsCount: 7
                    }
                ]
            }]
        },
        [CATEGORIES]: {
            keyName: CATEGORIES,
            items: [{
                collapsed: true,
                attribute: 'attr.product.id',
                filters: []
            }, {
                collapsed: true,
                attribute: DATE_DATASET_ATTRIBUTE,
                filters: [],
                granularity: 'GDC.time.week_us'
            }]
        },
        [FILTERS]: {
            keyName: FILTERS,
            items: [{
                collapsed: true,
                attribute: 'attr.product.id',
                filters: [
                    {
                        attribute: 'attr.product.id',
                        allElements: elements,
                        selectedElements: [elements[1], elements[3]],
                        isInverted: false,
                        totalElementsCount: 7
                    }
                ]
            }, {
                collapsed: true,
                attribute: DATE_DATASET_ATTRIBUTE,
                filters: [
                    {
                        attribute: DATE_DATASET_ATTRIBUTE,
                        allElements: [],
                        selectedElements: [],
                        isInverted: true,
                        totalElementsCount: 0,
                        dateDataSet: 'date.dim_date',
                        interval: {
                            granularity: 'GDC.time.year',
                            interval: [
                                -6,
                                0
                            ]
                        }
                    }
                ],
                dateDataSet: 'date.dim_date',
                granularity: 'GDC.time.year',
                aggregation: null,
                showInPercent: false,
                showPoP: false
            }]
        },
        [STACKS]: {
            keyName: STACKS,
            items: [{
                collapsed: true,
                attribute: 'attr.product.id',
                filters: []
            }]
        }
    }
};

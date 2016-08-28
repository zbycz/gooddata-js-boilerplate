import { DATE_DATASET_ATTRIBUTE } from '../models/date_item';

export const elements = {
    '0': {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168279',
        title: 'CompuSci'
    },
    '1': {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168282',
        title: 'Educationly'
    },
    '2': {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=169655',
        title: 'Explorer'
    },
    '3': {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168284',
        title: 'Grammar Plus'
    },
    '4': {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=964771',
        title: 'PhoenixSoft'
    },
    '5': {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=169656',
        title: 'TouchAll'
    },
    '6': {
        uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=965523',
        title: 'WonderKid'
    }
};

export const elementNotAvailable = {
    uri: '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=666',
    available: false
};

export const countryElements = [
    {
        uri: '/gdc/md/TeamOneGoodSales1/obj/901/elements?id=168288',
        title: 'US & A'
    },
    {
        uri: '/gdc/md/TeamOneGoodSales1/obj/901/elements?id=168289',
        title: 'Canada'
    },
    {
        uri: '/gdc/md/TeamOneGoodSales1/obj/901/elements?id=168290',
        title: 'Colombia'
    }
];

export const countryElementNotAvailable = {
    uri: '/gdc/md/TeamOneGoodSales1/obj/901/elements?id=666',
    available: false
};

export const cartAdditionsFact = {
    id: 'fact.spend_analysis.cart_additions',
    identifier: 'fact.spend_analysis.cart_additions',
    isAvailable: true,
    summary: '',
    title: 'Cart Additions',
    type: 'fact',
    uri: '/gdc/md/TeamOneGoodSales1/obj/15418'
};

export const awarenessMetric = {
    expression: 'SELECT SUM([/gdc/md/TeamOneGoodSales1/obj/15417])',
    format: '[>=1000000000]$#,,,.0 B;[<=-1000000000]-$#,,,.0 B;[>=1000000]$#,,.0 M;[<=-1000000]-$#,,.0 M;[>=1000]$#,.0 K;[<=-1000]-$#,.0 K;$#,##0',
    id: 'aaeFKXFYiCc0',
    identifier: 'aaeFKXFYiCc0',
    isAvailable: true,
    summary: '',
    title: 'Awareness',
    type: 'metric',
    uri: '/gdc/md/TeamOneGoodSales1/obj/16212'
};

export const productAttribute = {
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
};

export const countryAttribute = {
    dimensionUri: '/gdc/md/TeamOneGoodSales1/obj/902',
    summary: '',
    identifier: 'attr.country.id',
    dfUri: '/gdc/md/TeamOneGoodSales1/obj/902',
    dfIdentifier: 'label.country.id.name',
    uri: '/gdc/md/TeamOneGoodSales1/obj/901',
    granularity: 'attr.country.id',
    elementsUri: '/gdc/md/TeamOneGoodSales1/obj/901/elements',
    dataset: null,
    title: 'Country',
    type: 'attribute',
    id: 'attr.country.id',
    isAvailable: true
};

export const itemCache = {
    'fact.spend_analysis.cart_additions': cartAdditionsFact,
    'aaeFKXFYiCc0': awarenessMetric,
    'attr.product.id': productAttribute,
    'attr.country.id': countryAttribute
};

export const dateCreated = {
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
    }, {
        dimensionUri: '/gdc/md/TeamOneGoodSales1/obj/15174',
        summary: 'Quarter summary',
        dateType: 'GDC.time.quarter',
        identifier: 'activity.quarter',
        dfUri: '/gdc/md/TeamOneGoodSales1/obj/1629',
        dfIdentifier: 'quarter.dim_date',
        uri: '/gdc/md/TeamOneGoodSales1/obj/1624',
        granularity: 'GDC.time.quarter',
        elementsUri: '/gdc/md/TeamOneGoodSales1/obj/629/elements',
        title: 'Quarter (Activity)'
    }],
    id: 'date.dim_date',
    identifier: 'date.dim_date',
    isAvailable: true,
    summary: 'Date dimension (Date Created)',
    title: 'Date dimension (Date Created)',
    type: 'dimension',
    uri: '/gdc/md/TeamOneGoodSales1/obj/15174'
};

export const metricBucketItems = [{
    attribute: 'aaeFKXFYiCc0',
    filters: [],
    showInPercent: false,
    showPoP: false
}, {
    aggregation: 'SUM',
    attribute: 'fact.spend_analysis.cart_additions',
    filters: [],
    showInPercent: true,
    showPoP: false
}, {
    attribute: 'aaeFKXFYiCc0',
    showInPercent: false,
    showPoP: true,
    filters: [
        {
            attribute: 'attr.country.id',
            allElements: countryElements,
            selectedElements: [countryElements[0], countryElements[1], countryElementNotAvailable],
            isInverted: false,
            totalElementsCount: countryElements.length
        }
    ]
}, {
    aggregation: 'COUNT',
    attribute: 'attr.product.id',
    showInPercent: false,
    showPoP: false,
    filters: []
}];

export const categoriesBucketItems = [{
    attribute: 'attr.product.id',
    filters: []
}, {
    attribute: DATE_DATASET_ATTRIBUTE,
    filters: [],
    granularity: 'GDC.time.week_us'
}];

export const filterBucketItems = [{
    attribute: 'attr.product.id',
    filters: [
        {
            attribute: 'attr.product.id',
            allElements: elements,
            selectedElements: [elements['1'], elements['3'], elementNotAvailable],
            isInverted: false,
            totalElementsCount: 7,
            isModified: true
        }
    ]
}, {
    attribute: DATE_DATASET_ATTRIBUTE,
    filters: [
        {
            attribute: DATE_DATASET_ATTRIBUTE,
            allElements: [],
            selectedElements: [],
            isInverted: true,
            totalElementsCount: 0,
            isModified: true,
            dimension: 'date.dim_date',
            interval: {
                granularity: 'GDC.time.year',
                interval: [
                    -6,
                    0
                ]
            }
        }
    ],
    granularity: 'GDC.time.year',
    aggregation: null,
    showInPercent: false,
    showPoP: false
}];

export const filterBucketItemsWithNoSelection = [{
    attribute: 'attr.product.id',
    filters: [
        {
            attribute: 'attr.product.id',
            allElements: elements,
            selectedElements: [],
            isInverted: false,
            totalElementsCount: 7,
            isModified: true
        }
    ]
}, {
    attribute: DATE_DATASET_ATTRIBUTE,
    filters: [
        {
            attribute: DATE_DATASET_ATTRIBUTE,
            allElements: [],
            selectedElements: [],
            isInverted: true,
            totalElementsCount: 0,
            isModified: true,
            dimension: 'date.dim_date',
            interval: { name: 'all_time' }
        }
    ],
    aggregation: null,
    showInPercent: false,
    showPoP: false
}];

export const stacksBucketItems = [{
    attribute: 'attr.product.id',
    filters: []
}];

export const metadataBucketMeasures = [
    { measure: {
        type: 'metric',
        title: 'Awareness',
        format: '[>=1000000000]$#,,,.0 B;[<=-1000000000]-$#,,,.0 B;[>=1000000]$#,,.0 M;[<=-1000000]-$#,,.0 M;[>=1000]$#,.0 K;[<=-1000]-$#,.0 K;$#,##0',
        objectUri: '/gdc/md/TeamOneGoodSales1/obj/16212',
        measureFilters: [],
        showInPercent: false,
        showPoP: false
    } },
    { measure: {
        type: 'fact',
        aggregation: 'sum',
        title: '% Sum of Cart Additions',
        format: '#,##0.00',
        objectUri: '/gdc/md/TeamOneGoodSales1/obj/15418',
        measureFilters: [],
        showInPercent: true,
        showPoP: false
    } },
    { measure: {
        type: 'metric',
        objectUri: '/gdc/md/TeamOneGoodSales1/obj/16212',
        title: 'Awareness (Country: US & A, Canada)',
        format: '[>=1000000000]$#,,,.0 B;[<=-1000000000]-$#,,,.0 B;[>=1000000]$#,,.0 M;[<=-1000000]-$#,,.0 M;[>=1000]$#,.0 K;[<=-1000]-$#,.0 K;$#,##0',
        measureFilters: [{
            listAttributeFilter: {
                attribute: '/gdc/md/TeamOneGoodSales1/obj/901',
                displayForm: '/gdc/md/TeamOneGoodSales1/obj/902',
                'default': {
                    negativeSelection: false,
                    attributeElements: [
                        '/gdc/md/TeamOneGoodSales1/obj/901/elements?id=168288',
                        '/gdc/md/TeamOneGoodSales1/obj/901/elements?id=168289',
                        '/gdc/md/TeamOneGoodSales1/obj/901/elements?id=666'
                    ]
                }
            }
        }],
        showInPercent: false,
        showPoP: true
    } },
    { measure: {
        aggregation: 'count',
        format: '#,##0.00',
        measureFilters: [],
        objectUri: '/gdc/md/TeamOneGoodSales1/obj/949',
        showInPercent: false,
        showPoP: false,
        title: 'Count of Product',
        type: 'attribute'
    } }
];

export const metadataBucketCategories = [
    { category: {
        type: 'attribute',
        collection: 'attribute',
        attribute: '/gdc/md/TeamOneGoodSales1/obj/949',
        displayForm: '/gdc/md/TeamOneGoodSales1/obj/952'
    } },
    { category: {
        type: 'date',
        collection: 'attribute',
        displayForm: '/gdc/md/TeamOneGoodSales1/obj/629',
        attribute: '/gdc/md/TeamOneGoodSales1/obj/701'
    } }
];

export const metadataBucketCategoriesWithStacks = [
    ...metadataBucketCategories,
    {
        category: {
            type: 'attribute',
            collection: 'stack',
            attribute: '/gdc/md/TeamOneGoodSales1/obj/949',
            displayForm: '/gdc/md/TeamOneGoodSales1/obj/952'
        }
    }
];

const listAttributeFilterMD = {
    listAttributeFilter: {
        'default': {
            negativeSelection: false,
            attributeElements: []
        },
        attribute: '/gdc/md/TeamOneGoodSales1/obj/949',
        displayForm: '/gdc/md/TeamOneGoodSales1/obj/952'
    }
};

const listAttributeFilterWithSelectionMD = {
    listAttributeFilter: {
        ...listAttributeFilterMD.listAttributeFilter,
        'default': {
            negativeSelection: false,
            attributeElements: [
                '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168282',
                '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168284',
                '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=666'
            ]
        }
    }
};

const dateFilterMD = {
    dateFilter: {
        granularity: 'GDC.time.year',
        dataset: '/gdc/md/TeamOneGoodSales1/obj/15174',
        attribute: '/gdc/md/TeamOneGoodSales1/obj/701',
        type: 'relative'
    }
};

const dateFilterWithSelectionMD = {
    dateFilter: {
        ...dateFilterMD.dateFilter,
        from: -6,
        to: 0,
        type: 'relative'
    }
};

export const metadataBucketFiltersNoSelection = [
    listAttributeFilterMD,
    dateFilterMD
];

export const metadataBucketFiltersWithSelection = [
    listAttributeFilterWithSelectionMD,
    dateFilterWithSelectionMD
];

export const metadataBucketFiltersWithQuarterGranularity = [
    {
        dateFilter: {
            granularity: 'GDC.time.quarter',
            dataset: '/gdc/md/TeamOneGoodSales1/obj/15174',
            attribute: '/gdc/md/TeamOneGoodSales1/obj/1624',
            type: 'relative',
            from: -3,
            to: 0
        }
    }
];

export const dateDataSetsAvailable = [
    {
        'title': 'Date (Activity)',
        'summary': 'DataSet Date',
        'identifier': 'activity.dataset.dt',
        'uri': '/gdc/md/TeamOneGoodSales1/obj/727',
        'attributes': [
            {
                'granularity': 'activity.date',
                'dfIdentifier': 'activity.date.mmddyyyy',
                'dfUri': '/gdc/md/TeamOneGoodSales1/obj/593',
                'dateType': 'GDC.time.date',
                'uri': '/gdc/md/TeamOneGoodSales1/obj/590'
            },
            {
                'granularity': 'activity.month',
                'dfIdentifier': 'activity.act81lMifn6q',
                'dfUri': '/gdc/md/TeamOneGoodSales1/obj/617',
                'dateType': 'GDC.time.month',
                'uri': '/gdc/md/TeamOneGoodSales1/obj/616'
            },
            {
                'granularity': 'activity.euweek',
                'dfIdentifier': 'activity.aa281lMifn6q',
                'dfUri': '/gdc/md/TeamOneGoodSales1/obj/649',
                'dateType': 'GDC.time.week_us',
                'uri': '/gdc/md/TeamOneGoodSales1/obj/644'
            },
            {
                'granularity': 'activity.quarter',
                'dfIdentifier': 'activity.aci81lMifn6q',
                'dfUri': '/gdc/md/TeamOneGoodSales1/obj/657',
                'dateType': 'GDC.time.quarter',
                'uri': '/gdc/md/TeamOneGoodSales1/obj/656'
            },
            {
                'granularity': 'activity.year',
                'dfIdentifier': 'activity.aag81lMifn6q',
                'dfUri': '/gdc/md/TeamOneGoodSales1/obj/721',
                'dateType': 'GDC.time.year',
                'uri': '/gdc/md/TeamOneGoodSales1/obj/701'
            }
        ],
        'type': 'dateDataSet',
        'id': 'activity.dataset.dt',
        'isAvailable': true
    },
    {
        'title': 'Date (Date)',
        'summary': 'DataSet Date',
        'identifier': 'date.dataset.dt',
        'uri': '/gdc/md/TeamOneGoodSales1/obj/319917',
        'attributes': [
            {
                'granularity': 'date.year',
                'dfIdentifier': 'date.aag81lMifn6q',
                'dfUri': '/gdc/md/TeamOneGoodSales1/obj/319875',
                'dateType': 'GDC.time.year',
                'uri': '/gdc/md/TeamOneGoodSales1/obj/319857'
            },
            {
                'granularity': 'date.euweek',
                'dfIdentifier': 'date.aa281lMifn6q',
                'dfUri': '/gdc/md/TeamOneGoodSales1/obj/319889',
                'dateType': 'GDC.time.week_us',
                'uri': '/gdc/md/TeamOneGoodSales1/obj/319862'
            },
            {
                'granularity': 'date.quarter',
                'dfIdentifier': 'date.aci81lMifn6q',
                'dfUri': '/gdc/md/TeamOneGoodSales1/obj/319907',
                'dateType': 'GDC.time.quarter',
                'uri': '/gdc/md/TeamOneGoodSales1/obj/319872'
            },
            {
                'granularity': 'date.month',
                'dfIdentifier': 'date.act81lMifn6q',
                'dfUri': '/gdc/md/TeamOneGoodSales1/obj/319908',
                'dateType': 'GDC.time.month',
                'uri': '/gdc/md/TeamOneGoodSales1/obj/319873'
            },
            {
                'granularity': 'date.date',
                'dfIdentifier': 'date.date.mmddyyyy',
                'dfUri': '/gdc/md/TeamOneGoodSales1/obj/319913',
                'dateType': 'GDC.time.date',
                'uri': '/gdc/md/TeamOneGoodSales1/obj/319874'
            }
        ],
        'type': 'dateDataSet',
        'id': 'date.dataset.dt',
        'isAvailable': true
    },
    {
        'title': 'Date (Activity)',
        'summary': 'DataSet Date',
        'identifier': 'activity.dataset.dt',
        'uri': '/gdc/md/TeamOneGoodSales1/obj/15174',
        'attributes': [],
        'type': 'dateDataSet',
        'id': 'activity.dataset.dt',
        'isAvailable': true
    }
];

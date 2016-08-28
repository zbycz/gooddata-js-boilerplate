import { fromJS } from 'immutable';
import * as DatasetConstants from '../constants/Datasets';

const initialPaging = {
    start: 0,
    end: 39
};

import * as bucket from '../models/bucket';
import * as attributeElement from '../models/attribute_element';
import * as dateDataSet from '../models/date_dataset';

import * as CatalogueFilters from '../constants/catalogue_filters';

export default fromJS({
    appState: {
        appReady: false,
        header: {
            accountMenuItems: [],
            menuItems: []
        },
        bootstrapData: {
            featureFlags: {
                enableCsvUploader: false
            },
            project: {
                id: null
            }
        },
        errors: [],
        pageTitle: 'Analyze',
        meta: {
            device: {
                viewport: '0x0',
                pixelRatio: 0,
                isMobile: false
            },
            isEmbedded: false
        },
        messages: {
            displayed: [],
            delayed: []
        },
        drag: {
            activeItem: null
        },
        dialogs: {
            openReportConfirmation: {
                active: false,
                data: null
            },
            deleteReportConfirmation: {
                active: false,
                data: null
            },
            savingUntitledReport: {
                active: false
            }
        }
    },
    data: {
        itemCache: {},
        availableAttributes: {
            items: [],
            metric: null
        },
        attributeElements: attributeElement.INITIAL_MODEL,
        catalogue: {
            items: [],
            filters: [{
                name: CatalogueFilters.ALL,
                label: 'catalogue.filter.all',
                types: ['metric', 'attribute', 'fact']
            }, {
                name: CatalogueFilters.METRICS,
                label: 'catalogue.filter.metrics',
                types: ['metric', 'fact']
            }, {
                name: CatalogueFilters.ATTRIBUTES,
                label: 'catalogue.filter.attributes',
                types: ['attribute']
            }],
            activeFilterIndex: DatasetConstants.FILTER_ALL_DATA,
            activeDatasetId: DatasetConstants.ALL_DATA_ID,
            isLoading: false,
            isPageLoading: false,
            query: '',
            paging: initialPaging,
            totals: {
                available: 0,
                unavailable: 0
            }
        },
        dateDataSets: dateDataSet.INITIAL_MODEL,
        datasets: {},
        visualizationType: 'column',
        buckets: bucket.INITIAL_MODEL,
        title: '',
        shortcut: {
            shortcutDateDataSets: {
                loaded: false,
                available: []
            }
        }
    },
    report: {
        execution: {
            id: null,
            first: true,
            running: false,
            data: null
        },
        saving: false,
        savingAsNew: false,
        opening: false,
        nowOpen: false,
        lastSavedObject: {
            visualization: {
                meta: {
                    title: '',
                    category: 'visualization'
                },
                content: null
            }
        }
    }
});

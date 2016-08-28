import {
    getReportTitle,
    isReportTitleEmpty,
    getNewReportMDObject,
    getItemCacheUris,
    getFilterItemsDefinitions,
    loadAdditionalData
} from '../report_service';
import * as TestMocks from '../../constants/TestMocks';
import initialState from '../../reducers/initial_state';
import * as StatePaths from '../../constants/StatePaths';
import { fromJS } from 'immutable';

describe('report_service', () => {
    const buckets = {
        measures: TestMocks.metadataBucketMeasures,
        categories: TestMocks.metadataBucketCategoriesWithStacks,
        filters: TestMocks.metadataBucketFiltersWithSelection
    };

    describe('getReportTitle and isReportTitleEmpty', () => {
        it('should initial title should be empty string', () => {
            expect(getReportTitle(initialState)).to.equal('');
            expect(isReportTitleEmpty(initialState)).to.equal(true);
        });

        it('should return current report title', () => {
            const updatedState = initialState.setIn(StatePaths.REPORT_CURRENT_TITLE, 'foo');

            expect(getReportTitle(updatedState)).to.equal('foo');
            expect(isReportTitleEmpty(updatedState)).to.equal(false);
        });
    });

    describe('getNewReportMDObject', () => {
        it('should return new report MDObject', () => {
            expect(getNewReportMDObject(initialState).toJS()).to.eql({
                'visualization': {
                    'meta': {
                        'title': '',
                        'category': 'visualization'
                    },
                    'content': {
                        'type': 'column',
                        'buckets': {
                            'measures': [],
                            'categories': [],
                            'filters': []
                        }
                    }
                }
            });
        });
    });

    describe('getItemCacheUris', () => {
        it('should prepare item cache from md object', () => {
            const itemCacheUris = getItemCacheUris(buckets);

            const expectedUris = [
                '/gdc/md/TeamOneGoodSales1/obj/16212',
                '/gdc/md/TeamOneGoodSales1/obj/15418',
                '/gdc/md/TeamOneGoodSales1/obj/901',
                '/gdc/md/TeamOneGoodSales1/obj/949',
                '/gdc/md/TeamOneGoodSales1/obj/701'
            ];

            expect(itemCacheUris).to.eql(expectedUris);
        });

        it('should include list attribute filters', () => {
            const bucketsWithFilters = {
                measures: [],
                categories: [],
                filters: TestMocks.metadataBucketFiltersWithSelection
            };

            const itemCacheUris = getItemCacheUris(bucketsWithFilters);

            const expectedUris = [
                '/gdc/md/TeamOneGoodSales1/obj/949'
            ];

            expect(itemCacheUris).to.eql(expectedUris);
        });
    });

    describe('getFilterItemsDefinitions', () => {
        it('should prepare filter items from md object', () => {
            const filterItemsDefinitions = getFilterItemsDefinitions(buckets);

            const expected = [{
                dfUri: '/gdc/md/TeamOneGoodSales1/obj/902',
                elementUris: [
                    '/gdc/md/TeamOneGoodSales1/obj/901/elements?id=168288',
                    '/gdc/md/TeamOneGoodSales1/obj/901/elements?id=168289',
                    '/gdc/md/TeamOneGoodSales1/obj/901/elements?id=666'
                ]
            }, {
                dfUri: '/gdc/md/TeamOneGoodSales1/obj/952',
                elementUris: [
                    '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168282',
                    '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168284',
                    '/gdc/md/TeamOneGoodSales1/obj/949/elements?id=666'
                ]
            }];

            expect(filterItemsDefinitions).to.eql(expected);
        });
    });

    describe('loadAdditionalData', () => {
        it('should load additional data when not present in item cache and skip if present', () => {
            const getObjectsSpy = sinon.spy(() => Promise.resolve([{
                'metric': {
                    'content': {
                        'expression': 'select 1',
                        'folders': [
                            '/gdc/md/TeamOneGoodSales1/obj/1512'
                        ],
                        'format': '#,##0.00'
                    },
                    'meta': {
                        'author': '/gdc/account/profile/8625a1ac666dd21ca4c520e19acc5a8f',
                        'category': 'metric',
                        'contributor': '/gdc/account/profile/8625a1ac666dd21ca4c520e19acc5a8f',
                        'created': '2013-03-07 19:05:05',
                        'deprecated': '0',
                        'identifier': 'aaeb7jTCfexV',
                        'isProduction': 1,
                        'locked': 1,
                        'summary': '',
                        'tags': '',
                        'title': '_Close [BOP]',
                        'updated': '2015-10-07 13:13:09',
                        'uri': '/gdc/md/TeamOneGoodSales1/obj/1638'
                    }
                }
            }]));
            const loadAttributeElementsSpy = sinon.spy(() => Promise.resolve([]));
            const loadDateDataSetsSpy = sinon.spy(() => Promise.resolve({}));
            const stateWithCache = initialState.setIn(StatePaths.ITEM_CACHE, fromJS({
                'identifier1': {
                    objectUri: '/gdc/md/TeamOneGoodSales1/obj/1639'
                }
            }));
            const loadAdditionalDataReturn = loadAdditionalData(
                {
                    content: {
                        buckets: {
                            measures: [
                                {
                                    measure: {
                                        objectUri: '/gdc/md/TeamOneGoodSales1/obj/1638'
                                    }
                                }, {
                                    measure: {
                                        objectUri: '/gdc/md/TeamOneGoodSales1/obj/1639'
                                    }
                                }
                            ],
                            categories: [],
                            filters: []
                        }
                    },
                    meta: {
                        title: 'title'
                    }
                },
                () => stateWithCache,
                getObjectsSpy,
                loadAttributeElementsSpy,
                loadDateDataSetsSpy
            );

            return loadAdditionalDataReturn.then(result => {
                expect(result).to.eql({
                    itemCache: {
                        'aaeb7jTCfexV': {
                            'expression': 'select 1',
                            'format': '#,##0.00',
                            'id': 'aaeb7jTCfexV',
                            'identifier': 'aaeb7jTCfexV',
                            'isAvailable': true,
                            'summary': '',
                            'title': '_Close [BOP]',
                            'type': 'metric',
                            'uri': '/gdc/md/TeamOneGoodSales1/obj/1638'
                        }
                    },
                    filterItems: {},
                    dateDataSets: {}
                });
            });
        });
    });
});

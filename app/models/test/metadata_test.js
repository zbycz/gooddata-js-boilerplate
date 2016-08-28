import { fromJS } from 'immutable';
import { cloneDeep, keys } from 'lodash';

import { bucketsToMetadata, metadataToBuckets } from '../metadata';
import { getDecoratedBuckets } from '../../selectors/buckets_selector';
import { buildBucketItem } from '../bucket_item';
import initialState from '../../reducers/initial_state';
import * as Paths from '../../constants/StatePaths';
import * as TestMocks from '../../constants/TestMocks';
import { METRICS, CATEGORIES, FILTERS, STACKS } from '../../constants/bucket';
import { SORT_DIR_ASC, SORT_DIR_DESC } from '../../constants/sort_directions';

describe('Buckets to metadata object conversion', () => {
    let state,
        additionalData,
        buckets,
        itemCache,
        metricsBucket,
        categoriesBucket,
        filtersBucket,
        filtersBucketWithNoSelection,
        stacksBucket,
        dateDataSets;

    beforeEach(() => {
        itemCache = TestMocks.itemCache;

        metricsBucket = {
            keyName: METRICS,
            items: TestMocks.metricBucketItems.map(buildBucketItem)
        };

        categoriesBucket = {
            keyName: CATEGORIES,
            items: TestMocks.categoriesBucketItems.map(buildBucketItem)
        };

        filtersBucket = {
            keyName: FILTERS,
            items: TestMocks.filterBucketItems.map(buildBucketItem)
        };

        filtersBucketWithNoSelection = {
            keyName: FILTERS,
            items: TestMocks.filterBucketItemsWithNoSelection.map(buildBucketItem)
        };

        stacksBucket = {
            keyName: STACKS,
            items: TestMocks.stacksBucketItems.map(buildBucketItem)
        };

        dateDataSets = {
            available: [TestMocks.dateCreated],
            unavailable: 1,
            dateDataSet: TestMocks.dateCreated
        };

        state = initialState
            .mergeIn(['appState'], {
                bootstrapData: {
                    project: { id: 'my project' }
                }
            })
            .mergeIn(Paths.DATA, fromJS({
                itemCache,
                attributeElements: {},
                catalogue: {
                    items: ['fact.spend_analysis.cart_additions', 'aaeFKXFYiCc0', 'attr.product.id']
                },
                dateDataSets,
                visualizationType: 'bar',
                buckets: {
                    [METRICS]: metricsBucket,
                    [CATEGORIES]: categoriesBucket,
                    [FILTERS]: filtersBucket,
                    [STACKS]: stacksBucket
                }
            }));

        buckets = getDecoratedBuckets(state).delete('original').toJS();

        additionalData = {
            itemCache,
            dateDataSets,
            filterItems: {
                '/gdc/md/TeamOneGoodSales1/obj/952': {
                    items: TestMocks.elements,
                    total: keys(TestMocks.elements).length
                },
                '/gdc/md/TeamOneGoodSales1/obj/902': {
                    items: TestMocks.countryElements,
                    total: keys(TestMocks.countryElements).length
                }
            }
        };
    });

    describe('table', () => {
        let mdObject, reconstructedState;

        beforeEach(() => {
            mdObject = bucketsToMetadata('table', buckets);

            reconstructedState = metadataToBuckets({
                metadataObject: mdObject,
                additionalData
            });
        });

        describe('serialization', () => {
            it('returns proper metrics', () => {
                expect(mdObject.measures).to.eql(TestMocks.metadataBucketMeasures);
            });

            it('returns proper categories for table', () => {
                expect(mdObject.categories).to.eql(TestMocks.metadataBucketCategories);
            });

            it('returns proper filters for table', () => {
                expect(mdObject.filters).to.eql(TestMocks.metadataBucketFiltersWithSelection);
            });

            it('returns filters for table even if no element selected', () => {
                let newState = state
                                .setIn(['data', 'buckets', 'filters', 'items', 0, 'filters', 0, 'selectedElements'], fromJS([]))
                                .setIn(['data', 'buckets', 'filters', 'items', 1, 'filters', 0, 'interval', 'interval'], fromJS(null));
                buckets = getDecoratedBuckets(newState).delete('original').toJS();

                const mdObjectWithNoSelection = bucketsToMetadata('table', buckets);
                const filters = mdObjectWithNoSelection.filters;

                expect(filters).to.eql(TestMocks.metadataBucketFiltersNoSelection);
            });

            it('returns dateFilter with quarter attribute in uri', () => {
                let newState = state
                    .setIn(['data', 'buckets', 'filters', 'items'], fromJS(
                        [
                            {
                                filters: [
                                    {
                                        attribute: 'attr.datedataset',
                                        selectedElements: [],
                                        dimension: 'date.dim_date',
                                        interval: {
                                            granularity: 'GDC.time.quarter',
                                            interval: [-3, 0]
                                        }
                                    }
                                ],
                                attribute: 'attr.datedataset'
                            }
                        ]
                    ));

                buckets = getDecoratedBuckets(newState).delete('original').toJS();

                const mdObjectWithNoSelection = bucketsToMetadata('table', buckets);
                const filters = mdObjectWithNoSelection.filters;

                expect(filters).to.eql(TestMocks.metadataBucketFiltersWithQuarterGranularity);
            });

            describe('with sort', () => {
                it('returns proper measures with sort', () => {
                    buckets.metrics.items[1].sort = SORT_DIR_ASC;
                    mdObject = bucketsToMetadata('table', buckets);

                    const metadataBucketMeasures = cloneDeep(TestMocks.metadataBucketMeasures);
                    metadataBucketMeasures[1].measure.sort = SORT_DIR_ASC;

                    reconstructedState = metadataToBuckets({
                        metadataObject: mdObject,
                        additionalData
                    });

                    expect(mdObject.measures).to.eql(metadataBucketMeasures);
                });

                it('returns proper categories with sort', () => {
                    buckets.categories.items[1].sort = SORT_DIR_ASC;
                    mdObject = bucketsToMetadata('table', buckets);

                    const metadataBucketCategories = cloneDeep(TestMocks.metadataBucketCategories);
                    metadataBucketCategories[1].category.sort = SORT_DIR_ASC;

                    reconstructedState = metadataToBuckets({
                        metadataObject: mdObject,
                        additionalData
                    });

                    expect(mdObject.categories).to.eql(metadataBucketCategories);
                });
            });
        });

        describe('deserialization', () => {
            it('should set proper metrics to buckets', () => {
                expect(reconstructedState.metrics).to.eql(metricsBucket);
            });

            it('should set proper categories to buckets', () => {
                expect(reconstructedState.categories).to.eql(categoriesBucket);
            });

            it('should set proper filters to buckets', () => {
                expect(reconstructedState.filters).to.eql(filtersBucket);
            });

            it('should set proper filters to bucket if no element selected', () => {
                const stateWithNoSelection = state
                    .setIn(['data', 'buckets', 'filters', 'items', 0, 'filters', 0, 'selectedElements'], fromJS([]))
                    .setIn(['data', 'buckets', 'filters', 'items', 1, 'filters', 0, 'interval', 'interval'], fromJS(null));
                const bucketsWithNoSelection = getDecoratedBuckets(stateWithNoSelection).delete('original').toJS();

                const reconstructedStateWithNoSelection = metadataToBuckets({
                    metadataObject: bucketsToMetadata('table', bucketsWithNoSelection),
                    additionalData
                });

                expect(reconstructedStateWithNoSelection.filters).to.eql(filtersBucketWithNoSelection);
            });
        });
    });

    describe('column', () => {
        let mdObject, reconstructedState;

        beforeEach(() => {
            mdObject = bucketsToMetadata('column', buckets);

            reconstructedState = metadataToBuckets({
                metadataObject: mdObject,
                additionalData
            });
        });

        describe('serialization', () => {
            it('returns proper categories for column', () => {
                expect(mdObject.categories).to.eql([
                    { category: {
                        type: 'attribute',
                        collection: 'view',
                        attribute: '/gdc/md/TeamOneGoodSales1/obj/949',
                        displayForm: '/gdc/md/TeamOneGoodSales1/obj/952'
                    } },
                    { category: {
                        type: 'date',
                        collection: 'view',
                        displayForm: '/gdc/md/TeamOneGoodSales1/obj/629',
                        attribute: '/gdc/md/TeamOneGoodSales1/obj/701'
                    } },
                    { category: {
                        type: 'attribute',
                        collection: 'stack',
                        attribute: '/gdc/md/TeamOneGoodSales1/obj/949',
                        displayForm: '/gdc/md/TeamOneGoodSales1/obj/952'
                    } }
                ]);
            });
        });

        describe('deserialization', () => {
            it('should set proper categories to buckets', () => {
                expect(reconstructedState.categories).to.eql(categoriesBucket);
            });

            it('should set proper stacks to buckets', () => {
                expect(reconstructedState.stacks).to.eql(stacksBucket);
            });
        });
    });

    describe('bar', () => {
        let mdObject, reconstructedState;

        beforeEach(() => {
            buckets.categories.items[0].sort = SORT_DIR_DESC;
            buckets.metrics.items[0].sort = SORT_DIR_DESC;
            mdObject = bucketsToMetadata('bar', buckets);

            reconstructedState = metadataToBuckets({
                metadataObject: mdObject,
                additionalData
            });
        });

        describe('serialization', () => {
            it('returns proper categories for bar', () => {
                expect(mdObject.categories).to.eql([
                    { category: {
                        type: 'attribute',
                        collection: 'view',
                        attribute: '/gdc/md/TeamOneGoodSales1/obj/949',
                        displayForm: '/gdc/md/TeamOneGoodSales1/obj/952',
                        sort: SORT_DIR_DESC
                    } },
                    { category: {
                        type: 'date',
                        collection: 'view',
                        displayForm: '/gdc/md/TeamOneGoodSales1/obj/629',
                        attribute: '/gdc/md/TeamOneGoodSales1/obj/701'
                    } },
                    { category: {
                        type: 'attribute',
                        collection: 'stack',
                        attribute: '/gdc/md/TeamOneGoodSales1/obj/949',
                        displayForm: '/gdc/md/TeamOneGoodSales1/obj/952'
                    } }
                ]);
            });

            it('specifies to sort first metric in descending order', () => {
                expect(mdObject.measures[0]).to.eql({
                    measure: {
                        type: 'metric',
                        title: 'Awareness',
                        format: '[>=1000000000]$#,,,.0 B;[<=-1000000000]-$#,,,.0 B;[>=1000000]$#,,.0 M;[<=-1000000]-$#,,.0 M;[>=1000]$#,.0 K;[<=-1000]-$#,.0 K;$#,##0',
                        objectUri: '/gdc/md/TeamOneGoodSales1/obj/16212',
                        measureFilters: [],
                        showInPercent: false,
                        showPoP: false,
                        sort: {
                            direction: SORT_DIR_DESC
                        }
                    }
                });
            });
        });

        describe('deserialization', () => {
            it('should set proper categories to buckets', () => {
                categoriesBucket.items[0].sort = SORT_DIR_DESC;
                expect(reconstructedState.categories).to.eql(categoriesBucket);
            });

            it('should set proper stacks to buckets', () => {
                expect(reconstructedState.stacks).to.eql(stacksBucket);
            });
        });
    });

    describe('line', () => {
        let mdObject, reconstructedState;

        beforeEach(() => {
            mdObject = bucketsToMetadata('line', buckets);

            reconstructedState = metadataToBuckets({
                metadataObject: mdObject,
                additionalData
            });
        });

        describe('serialization', () => {
            it('returns proper categories for line', () => {
                expect(mdObject.categories).to.eql([
                    { category: {
                        type: 'attribute',
                        collection: 'trend',
                        attribute: '/gdc/md/TeamOneGoodSales1/obj/949',
                        displayForm: '/gdc/md/TeamOneGoodSales1/obj/952'
                    } },
                    { category: {
                        type: 'date',
                        collection: 'trend',
                        displayForm: '/gdc/md/TeamOneGoodSales1/obj/629',
                        attribute: '/gdc/md/TeamOneGoodSales1/obj/701'
                    } },
                    { category: {
                        type: 'attribute',
                        collection: 'segment',
                        attribute: '/gdc/md/TeamOneGoodSales1/obj/949',
                        displayForm: '/gdc/md/TeamOneGoodSales1/obj/952'
                    } }
                ]);
            });
        });

        describe('deserialization', () => {
            it('should set proper categories to buckets', () => {
                expect(reconstructedState.categories).to.eql(categoriesBucket);
            });

            it('should set proper stacks to buckets', () => {
                expect(reconstructedState.stacks).to.eql(stacksBucket);
            });
        });
    });
});

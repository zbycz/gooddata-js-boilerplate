import { Map, List } from 'immutable';
import { range } from 'lodash';

import * as ActionTypes from '../../constants/Actions';
import * as Paths from '../../constants/StatePaths';
import initialState from '../../reducers/initial_state';

import { bucketItem } from '../../models/bucket_item';
import { METRICS, CATEGORIES, FILTERS } from '../../constants/bucket';

import * as Formatters from '../log_formatters';


describe('Log formatters', () => {
    let state;

    function createCatalogueItem(id, type = 'fact') {
        const item = Map({ id, type, identifier: id });

        state = state
            .setIn(Paths.CATALOGUE_ITEMS, state.getIn(Paths.CATALOGUE_ITEMS).push(item))
            .setIn([...Paths.ITEM_CACHE, id], item);

        return item;
    }

    function bucketsAddItem(keyName, id, type) {
        let item = bucketItem({ attribute: id }),
            kp = [...Paths.BUCKETS, keyName, 'items'];

        createCatalogueItem(id, type);
        state = state.setIn(kp, state.getIn(kp).push(item));

        return item;
    }

    function getState() {
        return state;
    }

    beforeEach(() => {
        state = initialState;
    });

    describe('DnD format', () => {
        const formatter = Formatters.dnd;

        it(`#${ActionTypes.BUCKETS_DND_ITEM_INSERT} should produce adi-bucket-item-insert message`, () => {
            const CATALOGUE_ITEM_ID = 'sample_catalogue_item';
            const catalogueItem = createCatalogueItem(CATALOGUE_ITEM_ID, 'attribute');

            const { message, params } = formatter({
                type: ActionTypes.BUCKETS_DND_ITEM_INSERT,
                payload: {
                    keyName: METRICS,
                    catalogueItem
                }
            }, getState);

            // SAMPLE:
            // adi-bucket-item-insert categories=0 metrics=0 stacks=0 ...
            // filters=0 from=catalogue to=metrics dragged=attribute
            expect(message).to.equal('adi-bucket-item-insert');

            expect(params.categories).to.equal(0);
            expect(params.metrics).to.equal(0);
            expect(params.stacks).to.equal(0);
            expect(params.filters).to.equal(0);
            expect(params.from).to.equal('catalogue');
            expect(params.to).to.equal(METRICS);
            expect(params.dragged).to.equal('attribute');
        });

        it(`#${ActionTypes.BUCKETS_DND_ITEM_REPLACE} should produce adi-bucket-item-replace message`, () => {
            const BUCKET_ID = METRICS;

            const catalogueItem = createCatalogueItem('sample_catalogue_item', 'metric');
            const item = bucketsAddItem(BUCKET_ID, 'other_item');

            const { message, params } = formatter({
                type: ActionTypes.BUCKETS_DND_ITEM_REPLACE,
                payload: {
                    bucketItem: item,
                    catalogueItem
                }
            }, getState);

            // SAMPLE:
            // adi-bucket-item-replace from=catalogue to=metrics dragged=metric
            expect(message).to.equal('adi-bucket-item-replace');

            expect(params.from).to.equal('catalogue');
            expect(params.to).to.equal(state.getIn([...Paths.BUCKETS, BUCKET_ID, 'keyName']));
            expect(params.dragged).to.equal('metric');
        });

        it(`#${ActionTypes.BUCKETS_DND_ITEM_REMOVE} should produce adi-bucket-item-remove message`, () => {
            const BUCKET_ID = METRICS;
            const item = bucketsAddItem(BUCKET_ID, 'sample_catalogue_item', 'attribute');

            const { message, params } = formatter({
                type: ActionTypes.BUCKETS_DND_ITEM_REMOVE,
                payload: {
                    bucketItem: item
                }
            }, getState);

            // SAMPLE:
            // adi-bucket-item-remove categories=0 metrics=1 stacks=0 ...
            // filters=0 from=metrics to=trash dragged=attribute
            expect(message).to.equal('adi-bucket-item-remove');

            expect(params.categories).to.equal(0);
            expect(params.metrics).to.equal(1);
            expect(params.stacks).to.equal(0);
            expect(params.filters).to.equal(0);
            expect(params.from).to.equal(METRICS);
            expect(params.to).to.equal('trash');
            expect(params.dragged).to.equal('attribute');
        });

        it(`#${ActionTypes.DND_ITEM_DRAG_FAILED} should produce adi-drag-failed message`, () => {
            const { message, params } = formatter({
                type: ActionTypes.DND_ITEM_DRAG_FAILED,
                payload: {
                    from: 'catalogue',
                    dragged: 'attribute',
                    mouseX: 0,
                    mouseY: 0
                }
            }, getState);

            // SAMPLE:
            // adi-drag-failed mouse_x=524 mouse_y=611 ...
            // viewport_width=1440 viewport_height=782 ...
            // from=catalogue dragged=attribute
            expect(message).to.equal('adi-drag-failed');

            expect(params.mouseX).to.equal(0);
            expect(params.mouseY).to.equal(0);
            expect(params.viewportWidth).to.equal('0');
            expect(params.viewportHeight).to.equal('0');

            expect(params.from).to.equal('catalogue');
            expect(params.dragged).to.equal('attribute');
        });

        it(`#${ActionTypes.BUCKETS_DND_ITEM_SWAP} should produce adi-bucket-item-swap message [on replace]`, () => {
            const FROM_BUCKET_IDX = CATEGORIES, TO_BUCKET_IDX = FILTERS;
            const from = bucketsAddItem(FROM_BUCKET_IDX, 'from');
            const to = bucketsAddItem(TO_BUCKET_IDX, 'to');

            const { message, params } = formatter({
                type: ActionTypes.BUCKETS_DND_ITEM_SWAP,
                payload: {
                    from,
                    to,
                    original: {
                        from: state.getIn([...Paths.BUCKETS, FROM_BUCKET_IDX, 'keyName']),
                        to: state.getIn([...Paths.BUCKETS, TO_BUCKET_IDX, 'keyName']),
                        dragged: 'attribute'
                    }
                }
            }, getState);

            // SAMPLE:
            // adi-bucket-item-swap from=categories to=stacks dragged=attribute
            expect(message).to.equal('adi-bucket-item-swap');

            expect(params.from).to.equal(state.getIn([...Paths.BUCKETS, FROM_BUCKET_IDX, 'keyName']));
            expect(params.to).to.equal(state.getIn([...Paths.BUCKETS, TO_BUCKET_IDX, 'keyName']));
            expect(params.dragged).to.equal('attribute');
        });

        it(`#${ActionTypes.BUCKETS_DND_ITEM_SWAP} should produce adi-bucket-item-insert message [on insert]`, () => {
            const FROM_BUCKET_IDX = CATEGORIES;
            const from = bucketsAddItem(FROM_BUCKET_IDX, 'from');
            const TO_KEYNAME = state.getIn([...Paths.BUCKETS, FILTERS, 'keyName']);


            const { message, params } = formatter({
                type: ActionTypes.BUCKETS_DND_ITEM_SWAP,
                payload: {
                    from,
                    keyName: TO_KEYNAME,
                    original: {
                        from: state.getIn([...Paths.BUCKETS, FROM_BUCKET_IDX, 'keyName']),
                        to: TO_KEYNAME,
                        dragged: 'attribute'
                    }
                }
            }, getState);

            // SAMPLE:
            // adi-bucket-item-insert categories=0 metrics=0 stacks=0 ...
            // filters=0 from=catalogue to=metrics dragged=attribute
            expect(message).to.equal('adi-bucket-item-insert');

            expect(params.categories).to.equal(1);
            expect(params.metrics).to.equal(0);
            expect(params.stacks).to.equal(0);
            expect(params.filters).to.equal(0);
            expect(params.from).to.equal(state.getIn([...Paths.BUCKETS, FROM_BUCKET_IDX, 'keyName']));
            expect(params.to).to.equal(TO_KEYNAME);
            expect(params.dragged).to.equal('attribute');
        });
    });

    describe('Buckets formatter', () => {
        const formatter = Formatters.bucketsFormatter;

        it('should log change of visualization', () => {
            const action = {
                type: ActionTypes.BUCKETS_SELECT_VISUALIZATION_TYPE,
                payload: 'table'
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-event-visualization-changed');
            expect(params.visualization).to.equal('table');
        });

        it(`#${ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_FILTER} should produce adi-bucket-item-insert message`, () => {
            const CATALOGUE_ITEM_ID = 'sample_catalogue_item';
            const catalogueItem = createCatalogueItem(CATALOGUE_ITEM_ID, 'attribute');

            const { message, params } = formatter({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_ADD_FILTER,
                payload: {
                    keyName: 'filters',
                    catalogueItem
                }
            }, getState);

            // SAMPLE:
            // adi-bucket-item-insert categories=0 metrics=0 stacks=0 ...
            // filters=0 from=catalogue to=metrics dragged=attribute
            expect(message).to.equal('adi-bucket-item-insert');

            expect(params.categories).to.equal(0);
            expect(params.metrics).to.equal(0);
            expect(params.stacks).to.equal(0);
            expect(params.filters).to.equal(0);
            expect(params.from).to.equal('catalogue');
            expect(params.to).to.equal('filters');
            expect(params.dragged).to.equal('attribute');
        });

        it(`#${ActionTypes.BUCKETS_SET_BUCKET_ITEM_REMOVE_FILTER} should produce adi-bucket-item-remove message`, () => {
            const BUCKET_ID = FILTERS;
            const item = bucketsAddItem(BUCKET_ID, 'sample_catalogue_item', 'attribute');

            const { message, params } = formatter({
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_REMOVE_FILTER,
                payload: {
                    bucketItem: item
                }
            }, getState);

            // SAMPLE:
            // adi-bucket-item-remove categories=0 metrics=1 stacks=0 ...
            // filters=0 from=metrics to=trash dragged=attribute
            expect(message).to.equal('adi-bucket-item-remove');

            expect(params.categories).to.equal(0);
            expect(params.metrics).to.equal(0);
            expect(params.stacks).to.equal(0);
            expect(params.filters).to.equal(1);
            expect(params.from).to.equal('filters');
            expect(params.to).to.equal('trash');
            expect(params.dragged).to.equal('attribute');
        });

        it('should log change of show in percent [checked]', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT,
                payload: { value: true }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-checkbox-clicked');
            expect(params.name).to.equal('show-in-percent');
            expect(params.checked).to.equal(true);
        });

        it('should log change of show in percent [not checked]', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT,
                payload: { value: false }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-checkbox-clicked');
            expect(params.name).to.equal('show-in-percent');
            expect(params.checked).to.equal(false);
        });

        it('should log change of show pop [checked]', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_SHOW_POP,
                payload: { value: true }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-checkbox-clicked');
            expect(params.name).to.equal('show-pop');
            expect(params.checked).to.equal(true);
        });

        it('should log change of show pop [not checked]', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_SHOW_POP,
                payload: { value: false }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-checkbox-clicked');
            expect(params.name).to.equal('show-pop');
            expect(params.checked).to.equal(false);
        });

        it('should log change of aggregation function', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_AGGREGATION,
                payload: {
                    value: 'MEDIAN'
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-aggregation-function-changed');
            expect(params.name).to.equal('MEDIAN');
        });

        it('should log change of date dataset', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_DATE_DATASET,
                payload: {
                    index: 2,
                    relevance: 3
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-date-dataset-changed');
            expect(params.option).to.equal(2);
            expect(params.relevance).to.equal(3);
        });

        it('should log change of granularity', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_GRANULARITY,
                payload: {
                    value: 'some.granularity'
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-granularity-changed');
            expect(params.granularity).to.equal('some.granularity');
        });

        it('should log change of attribute filter', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER,
                payload: {
                    changes: {
                        selectedElements: List(['', ''])
                    }
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-attribute-filter-apply');
            expect(params.selectionSize).to.equal(2);
        });

        it('should log change of attribute filter [inverted]', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER,
                payload: {
                    changes: {
                        selectedElements: List(['', '']),
                        totalElementsCount: 500,
                        isInverted: true
                    }
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-attribute-filter-apply');
            expect(params.selectionSize).to.equal(498);
        });

        it('should skip log change of empty attribute filter', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER,
                payload: {
                    changes: {}
                }
            };

            const { message } = formatter(action, getState);

            expect(message).to.equal(null);
        });

        it('should log change of date filter (interval)', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER,
                payload: {
                    changes: { interval: Map({}) }
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-date-filter-interval');
            expect(params).to.eql({});
        });

        it('should log change of date filter (preset)', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_FILTER,
                payload: {
                    changes: { interval: Map({ name: 'abc' }) }
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-date-filter-preset');
            expect(params).to.eql({ preset: 'abc' });
        });

        it('should log change of metric filter', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
                payload: {
                    changes: {
                        selectedElements: List(['', ''])
                    }
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-metric-attribute-filter-apply');
            expect(params.selectionSize).to.equal(2);
        });

        it('should skip log change of empty metric filter', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
                payload: {
                    changes: {}
                }
            };

            const { message } = formatter(action, getState);

            expect(message).to.equal(null);
        });

        it('should log change of metric filter [inverted]', () => {
            const action = {
                type: ActionTypes.BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
                payload: {
                    changes: {
                        selectedElements: List(['', '']),
                        totalElementsCount: 500,
                        isInverted: true
                    }
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-metric-attribute-filter-apply');
            expect(params.selectionSize).to.equal(498);
        });
    });

    describe('Report formatter', () => {
        const formatter = Formatters.reportFormatter;

        it('start', () => {
            const action = {
                type: ActionTypes.REPORT_EXECUTION_STARTED,
                meta: {
                    id: '1',
                    startTime: 1
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-report-started');
            expect(params.reportId).to.equal('1');
            expect(params.startTime).to.equal(1);
        });

        it('success', () => {
            const action = {
                type: ActionTypes.REPORT_EXECUTION_FINISHED,
                meta: {
                    id: '1',
                    startTime: 1,
                    endTime: 2
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-report-finished');
            expect(params.reportId).to.equal('1');
            expect(params.startTime).to.equal(1);
            expect(params.endTime).to.equal(2);
            expect(params.duration).to.equal(1);
            expect(params.statusCode).to.equal(200);
        });

        it('401', () => {
            const action = {
                type: ActionTypes.REPORT_EXECUTION_ERROR,
                payload: { status: 401 },
                error: true,
                meta: {
                    id: '1',
                    startTime: 1,
                    endTime: 2
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-report-finished');
            expect(params.reportId).to.equal('1');
            expect(params.startTime).to.equal(1);
            expect(params.endTime).to.equal(2);
            expect(params.duration).to.equal(1);
            expect(params.statusCode).to.equal(401);
        });

        it('413', () => {
            const action = {
                type: ActionTypes.REPORT_EXECUTION_ERROR,
                payload: { status: 413 },
                error: true,
                meta: {
                    id: '1',
                    startTime: 1,
                    endTime: 2
                }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-report-finished');
            expect(params.reportId).to.equal('1');
            expect(params.startTime).to.equal(1);
            expect(params.endTime).to.equal(2);
            expect(params.duration).to.equal(1);
            expect(params.statusCode).to.equal(413);
        });
    });

    describe('Recommendations formatter', () => {
        const formatter = Formatters.recommendationsFormatter;

        it('showInPercent', () => {
            const action = {
                type: ActionTypes.RECOMMENDATION_CONTRIBUTION_IN_PERCENT,
                payload: { item: 'test' }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-recommendation-applied');
            expect(params).to.eql({ type: 'show-in-percents' });
        });

        it('showPoP', () => {
            const action = {
                type: ActionTypes.RECOMMENDATION_METRIC_WITH_PERIOD,
                payload: { item: 'test' }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-recommendation-applied');
            expect(params).to.eql({ type: 'period-over-period' });
        });

        it('comparison with period', () => {
            const action = {
                type: ActionTypes.RECOMMENDATION_COMPARISON_WITH_PERIOD,
                payload: { item: 'test' }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-recommendation-applied');
            expect(params).to.eql({ type: 'period-over-period' });
        });

        it('trending', () => {
            const action = {
                type: ActionTypes.RECOMMENDATION_TRENDING,
                payload: { item: 'test' }
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.equal('adi-recommendation-applied');
            expect(params).to.eql({ type: 'trending' });
        });
    });

    describe('catalogFormatter', () => {
        const formatter = Formatters.catalogFormatter;

        it('adi-catalogue-loading', () => {
            const action = {
                type: ActionTypes.CATALOGUE_UPDATE_STARTED
            };

            const { message } = formatter(action);

            expect(message).to.equal('adi-catalogue-loading');
        });

        it('adi-catalogue-ready published on first update', () => {
            const action = {
                type: ActionTypes.CATALOGUE_UPDATE_FINISHED,
                payload: {
                    items: range(0, 18).map(idx => ({ type: ['metric', 'fact', 'attribute'][idx % 3] })),
                    initialLoad: true,
                    totals: {
                        available: 200
                    }
                }
            };

            const { message, params } = formatter(action);

            expect(message).to.equal('adi-catalogue-ready');
            expect(params.totalCount).to.equal(200);
            expect(params.metricCount).to.equal(6);
            expect(params.factCount).to.equal(6);
            expect(params.attributeCount).to.equal(6);
        });

        it('adi-catalogue-ready not published on subsequent updates', () => {
            const action = {
                type: ActionTypes.CATALOGUE_UPDATE_FINISHED,
                payload: {
                    initialLoad: false
                }
            };

            const { message } = formatter(action);

            expect(message).to.equal(null);
        });

        it('set active dataset id (preselected)', () => {
            const action = {
                type: ActionTypes.CATALOGUE_SET_ACTIVE_DATASET_ID,
                payload: {
                    datasetId: '123',
                    preselect: true
                }
            };

            const { message, params } = formatter(action);

            expect(message).to.equal('adi-dataset-preselect');
            expect(params).to.eql({ dataset: '123' });
        });

        it('set active dataset id (preselected, no id specified)', () => {
            const action = {
                type: ActionTypes.CATALOGUE_SET_ACTIVE_DATASET_ID,
                payload: {
                    datasetId: null,
                    preselect: true
                }
            };

            const { message, params } = formatter(action);

            expect(message).to.equal(null);
            expect(params).to.eql({});
        });

        it('set active dataset id (change)', () => {
            const action = {
                type: ActionTypes.CATALOGUE_SET_ACTIVE_DATASET_ID,
                payload: {
                    datasetId: '123',
                    preselect: false
                }
            };

            const { message, params } = formatter(action);

            expect(message).to.equal('adi-dataset-change');
            expect(params).to.eql({ dataset: '123' });
        });

        it('set active dataset id (change, no id specified)', () => {
            const action = {
                type: ActionTypes.CATALOGUE_SET_ACTIVE_DATASET_ID,
                payload: {
                    datasetId: null,
                    preselect: false
                }
            };

            const { message, params } = formatter(action);

            expect(message).to.equal('adi-dataset-change');
            expect(params).to.eql({});
        });
    });

    describe('Shortcuts formatter', () => {
        const formatter = Formatters.shortcutsFormatter;

        it('attribute', () => {
            const action = {
                type: ActionTypes.SHORTCUT_APPLY_ATTRIBUTE,
                payload: 'shortcut-single-attribute'
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.eql('adi-shortcut-applied');
            expect(params).to.eql({ type: 'shortcut-single-attribute' });
        });

        it('metric', () => {
            const action = {
                type: ActionTypes.SHORTCUT_APPLY_METRIC,
                payload: 'shortcut-single-metric'
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.eql('adi-shortcut-applied');
            expect(params).to.eql({ type: 'shortcut-single-metric' });
        });

        it('metric over time', () => {
            const action = {
                type: ActionTypes.SHORTCUT_APPLY_METRIC_OVER_TIME,
                payload: 'shortcut-single-metric'
            };

            const { message, params } = formatter(action, getState);

            expect(message).to.eql('adi-shortcut-applied');
            expect(params).to.eql({ type: 'shortcut-metric-over-time' });
        });
    });

    describe('Reset formatter', () => {
        const formatter = Formatters.resetFormatter;

        it('reset', () => {
            const action = {
                type: ActionTypes.RESET_APPLICATION
            };

            const { message } = formatter(action);

            expect(message).to.eql('adi-report-reset');
        });
    });

    describe('Bootstrap formatter', () => {
        const formatter = Formatters.bootstrapFormatter;

        it('app ready', () => {
            const modifiedState = state.setIn(Paths.DEVICE_VIEWPORT, 'viewport')
                .setIn(Paths.DEVICE_PIXEL_RATIO, 'pixelRatio')
                .setIn(Paths.IS_MOBILE_DEVICE, false)
                .setIn(Paths.IS_EMBEDDED, true);
            const action = {
                type: ActionTypes.APP_READINESS_CHANGE,
                payload: { isReady: true }
            };

            const { message, params } = formatter(action, () => modifiedState);

            expect(message).to.eql('adi-app-ready');
            expect(params).to.eql({
                deviceViewport: 'viewport',
                devicePixelRatio: 'pixelRatio',
                isMobileDevice: false,
                isEmbedded: true
            });
        });
    });

    describe('Delete formatter', () => {
        const formatter = Formatters.deleteFormatter;

        it('report delete finished', () => {
            const action = {
                type: ActionTypes.DELETE_REPORT_FINISHED,
                payload: {
                    time: 1
                }
            };

            const { message, params } = formatter(action);

            expect(message).to.eql('adi-report-delete-finished');
            expect(params).to.eql({ time: 1 });
        });

        it('report delete error', () => {
            const action = {
                type: ActionTypes.DELETE_REPORT_ERROR,
                payload: {
                    time: 1
                }
            };

            const { message, params } = formatter(action);

            expect(message).to.eql('adi-report-delete-failed');
            expect(params).to.eql({ time: 1 });
        });
    });

    describe('Open formatter', () => {
        const formatter = Formatters.openFormatter;

        it('report opened', () => {
            const action = {
                type: ActionTypes.OPEN_REPORT_FINISHED,
                payload: { time: 1 }
            };

            const { message, params } = formatter(action);

            expect(message).to.eql('adi-report-open-finished');
            expect(params).to.eql({ time: 1 });
        });
    });

    describe('Save formatter', () => {
        const formatter = Formatters.saveFormatter;

        it('new report successfully saved', () => {
            const action = {
                type: ActionTypes.SAVE_REPORT_FINISHED,
                payload: { saveAsNew: true, time: 1 }
            };

            const { message, params } = formatter(action);

            expect(message).to.eql('adi-report-save-finished');
            expect(params).to.eql({ saveAsNew: true, time: 1 });
        });

        it('old report successfully saved', () => {
            const action = {
                type: ActionTypes.SAVE_REPORT_FINISHED,
                payload: { saveAsNew: false, time: 1 }
            };

            const { message, params } = formatter(action);

            expect(message).to.eql('adi-report-save-finished');
            expect(params).to.eql({ saveAsNew: false, time: 1 });
        });

        it('report not saved', () => {
            const action = {
                type: ActionTypes.SAVE_REPORT_ERROR,
                payload: { saveAsNew: false, time: 1 }
            };

            const { message, params } = formatter(action);

            expect(message).to.eql('adi-report-save-failed');
            expect(params).to.eql({ saveAsNew: false, time: 1 });
        });
    });
});

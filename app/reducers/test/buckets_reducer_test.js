import { fromJS, Map, List } from 'immutable';

import * as Actions from '../../constants/Actions';
import * as Paths from '../../constants/StatePaths';
import { BAR } from '../../constants/visualizationTypes';
import { DATE } from '../../constants/CatalogueItemTypes';
import { METRICS, CATEGORIES, STACKS, FILTERS } from '../../constants/bucket';
import initialState from '../../reducers/initial_state';
import bucketsReducer from '../buckets_reducer';
import { INITIAL_MODEL } from '../../models/bucket';
import { bucketItem } from '../../models/bucket_item';
import { DATE_DATASET_ATTRIBUTE } from '../../models/date_item';
import { metricAttributeFilter } from '../../models/metric_attribute_filter';

describe('Buckets Reducer tests', () => {
    let state, countryItem, cityItem, stateItem, dateItem, buckets;

    function reduce(type, payload) {
        state = bucketsReducer(state, { type, payload });
    }

    function bucketsAddItem(keyName, identifier, type, options) {
        let attribute = Map({ identifier, type }),
            item = bucketItem({ ...options, attribute: identifier, sort: 'asc' }),
            cp = [...Paths.ITEM_CACHE],
            kp = [...Paths.BUCKETS, keyName, 'items'];

        state = state
            .mergeIn(cp, { [identifier]: attribute })
            .setIn(kp, state.getIn(kp).push(item));

        return item;
    }

    function bucketsAddFilterItem(identifier, type, isAutoCreated = true) {
        return bucketsAddItem(FILTERS, identifier, type, {
            isAutoCreated, filters: [metricAttributeFilter({ attribute: identifier })]
        });
    }

    describe(`${Actions.BUCKETS_SELECT_VISUALIZATION_TYPE} test`, () => {
        beforeEach(() => {
            buckets = fromJS(INITIAL_MODEL);

            state = initialState.mergeIn(
                Paths.DATA,
                fromJS({
                    catalogue: {
                        items: []
                    },
                    visualizationType: 'bar',
                    buckets
                })
            );
        });

        it('should set the specified visualization type', () => {
            reduce(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE, 'column');
            expect(state.getIn(Paths.VISUALIZATION_TYPE)).to.equal('column');
        });

        describe('from table', () => {
            function fromTableTest(toViz) {
                return () => {
                    state = state.setIn(Paths.VISUALIZATION_TYPE, 'table');

                    countryItem = bucketsAddItem(CATEGORIES, 'country', 'attribute');
                    cityItem = bucketsAddItem(CATEGORIES, 'city', 'attribute');
                    stateItem = bucketsAddItem(CATEGORIES, 'state', 'attribute');
                    bucketsAddFilterItem('state', 'attribute');

                    reduce(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE, toViz);

                    expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items']).size).to.equal(1);
                    expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0])).to.equal(countryItem);

                    expect(state.getIn([...Paths.BUCKETS, STACKS, 'items']).size).to.equal(1);
                    expect(state.getIn([...Paths.BUCKETS, STACKS, 'items', 0])).to.equal(cityItem);

                    expect(state.getIn([...Paths.BUCKETS, FILTERS, 'items']).size).to.equal(0);
                };
            }

            for (let toViz of ['bar', 'column', 'line']) {
                it(`moves city to stack and removes state and auto-created filter - to ${toViz}`, fromTableTest(toViz));
            }

            it('moves country to stack and removes city - to line with date', () => {
                state = state.setIn(Paths.VISUALIZATION_TYPE, 'table');

                countryItem = bucketsAddItem(CATEGORIES, 'country', 'attribute');
                cityItem = bucketsAddItem(CATEGORIES, 'city', 'attribute');
                dateItem = bucketsAddItem(CATEGORIES, DATE_DATASET_ATTRIBUTE, 'date');

                reduce(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE, 'line');

                expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items']).size).to.equal(1);
                expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0])).to.equal(dateItem);

                expect(state.getIn([...Paths.BUCKETS, STACKS, 'items']).size).to.equal(1);
                expect(state.getIn([...Paths.BUCKETS, STACKS, 'items', 0])).to.equal(countryItem);
            });

            it('moves country to stack and removes date - to bar', () => {
                state = state.setIn(Paths.VISUALIZATION_TYPE, 'table');

                countryItem = bucketsAddItem(CATEGORIES, 'country', 'attribute');
                dateItem = bucketsAddItem(CATEGORIES, DATE_DATASET_ATTRIBUTE, 'date');

                reduce(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE, 'bar');

                expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items']).size).to.equal(1);
                expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0])).to.equal(countryItem);

                expect(state.getIn([...Paths.BUCKETS, STACKS, 'items']).size).to.equal(0);
            });
        });

        describe('to table', () => {
            function toTableTest(fromViz) {
                return () => {
                    state = state.setIn(Paths.VISUALIZATION_TYPE, fromViz);

                    countryItem = bucketsAddItem(CATEGORIES, 'country', 'attribute');
                    stateItem = bucketsAddItem(STACKS, 'state', 'attribute');

                    reduce(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE, 'table');

                    expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items']).size).to.equal(2);
                    expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 1])).to.equal(stateItem);

                    expect(state.getIn([...Paths.BUCKETS, STACKS, 'items']).size).to.equal(0);
                };
            }

            for (let fromViz of ['bar', 'column', 'line']) {
                it(`moves state to category - from ${fromViz}`, toTableTest(fromViz));
            }

            it('does not move duplicate item from stack', () => {
                state = state.setIn(Paths.VISUALIZATION_TYPE, 'column');

                countryItem = bucketsAddItem(CATEGORIES, 'country', 'attribute');
                bucketsAddItem(STACKS, 'country', 'attribute');

                reduce(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE, 'table');

                expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items']).size).to.equal(1);
                expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0])).to.equal(countryItem);

                expect(state.getIn([...Paths.BUCKETS, STACKS, 'items']).size).to.equal(0);
            });
        });

        describe('between charts', () => {
            function betweenChartsTest(fromViz, toViz) {
                return () => {
                    state = state.setIn(Paths.VISUALIZATION_TYPE, fromViz);

                    countryItem = bucketsAddItem(CATEGORIES, 'country', 'attribute');
                    stateItem = bucketsAddItem(STACKS, 'state', 'attribute');

                    reduce(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE, toViz);

                    expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items']).size).to.equal(1);
                    expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0])).to.equal(countryItem);

                    expect(state.getIn([...Paths.BUCKETS, STACKS, 'items']).size).to.equal(1);
                    expect(state.getIn([...Paths.BUCKETS, STACKS, 'items', 0])).to.equal(stateItem);
                };
            }

            for (let fromViz of ['bar', 'column', 'line']) {
                for (let toViz of ['bar', 'column', 'line']) {
                    if (fromViz === toViz) continue;

                    it(`no transition from ${fromViz} to ${toViz}`, betweenChartsTest(fromViz, toViz));
                }
            }
        });
    });

    describe('selected date clean up', () => {
        const dateDataSet = 'my date';

        const date = Map({ attribute: DATE_DATASET_ATTRIBUTE });

        beforeEach(() => {
            state = initialState.setIn(Paths.DATE_DATASETS_SELECTED, dateDataSet);
        });

        it('should keep the selected date dataset if date category is present', () => {
            state = state.updateIn(Paths.BUCKETS_CATEGORIES_ITEMS,
                categories => categories.push(date));

            // trigger random action
            reduce(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE, BAR);

            expect(state.getIn(Paths.DATE_DATASETS_SELECTED)).to.eql(dateDataSet);
        });

        it('should keep the selected date dataset if date filter is present', () => {
            state = state.updateIn(Paths.BUCKETS_FILTERS_ITEMS,
                filters => filters.push(date));

            // trigger random action
            reduce(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE, BAR);

            expect(state.getIn(Paths.DATE_DATASETS_SELECTED)).to.eql(dateDataSet);
        });

        it('should remove selected date dataset if neither date category or date filter is present', () => {
            // trigger random action
            reduce(Actions.BUCKETS_SELECT_VISUALIZATION_TYPE, BAR);

            expect(state.getIn(Paths.DATE_DATASETS_SELECTED)).to.eql(null);
        });
    });

    describe('bucket item actions', () => {
        let item;

        beforeEach(() => {
            const metrics = [{
                collapsed: true,
                filters: []
            }, {
                collapsed: true,
                filters: []
            }];

            state = initialState.setIn(Paths.VISUALIZATION_TYPE, BAR)
                .setIn(Paths.BUCKETS_METRICS_ITEMS, fromJS(metrics));

            item = state.getIn([...Paths.BUCKETS, METRICS, 'items', 0]);
        });

        describe(`${Actions.BUCKETS_SET_BUCKET_ITEM_COLLAPSED} test`, () => {
            it('should set collapsed state of bucket item', () => {
                reduce(Actions.BUCKETS_SET_BUCKET_ITEM_COLLAPSED, { item, collapsed: false });
                expect(state.getIn([...Paths.BUCKETS, METRICS, 'items', 0, 'collapsed'])).to.equal(false);

                item = state.getIn([...Paths.BUCKETS, METRICS, 'items', 0]);

                reduce(Actions.BUCKETS_SET_BUCKET_ITEM_COLLAPSED, { item, collapsed: true });
                expect(state.getIn([...Paths.BUCKETS, METRICS, 'items', 0, 'collapsed'])).to.equal(true);
            });

            it('should collapse other bucket items', () => {
                reduce(Actions.BUCKETS_SET_BUCKET_ITEM_COLLAPSED, { item, collapsed: false });
                expect(state.getIn([...Paths.BUCKETS, METRICS, 'items', 0, 'collapsed'])).to.equal(false);

                item = state.getIn([...Paths.BUCKETS, METRICS, 'items', 1]);

                reduce(Actions.BUCKETS_SET_BUCKET_ITEM_COLLAPSED, { item, collapsed: false });
                expect(state.getIn([...Paths.BUCKETS, METRICS, 'items', 0, 'collapsed'])).to.equal(true);
            });
        });

        describe(`${Actions.BUCKETS_SET_BUCKET_ITEM_AGGREGATION} test`, () => {
            it('should set aggregation of bucket item', () => {
                reduce(Actions.BUCKETS_SET_BUCKET_ITEM_AGGREGATION, { item, value: 'abc' });
                expect(state.getIn([...Paths.BUCKETS, METRICS, 'items', 0, 'aggregation'])).to.equal('abc');
            });
        });

        describe(`${Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT} test`, () => {
            it('should set showInPercent of bucket item', () => {
                const category = fromJS({ attribute: 'attribute' });

                state = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items'], List.of(category))
                    .setIn([...Paths.BUCKETS, METRICS, 'items'], List.of(item));

                reduce(Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT, { item, value: true });
                expect(state.getIn([...Paths.BUCKETS, METRICS, 'items', 0, 'showInPercent'])).to.equal(true);
            });
        });

        describe(`${Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_POP} test`, () => {
            it('should set showPoP of bucket item', () => {
                const date = fromJS({ attribute: DATE_DATASET_ATTRIBUTE });

                state = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items'], List.of(date))
                    .setIn([...Paths.BUCKETS, METRICS, 'items'], List.of(item));

                reduce(Actions.BUCKETS_SET_BUCKET_ITEM_SHOW_POP, { item, value: true });
                expect(state.getIn([...Paths.BUCKETS, METRICS, 'items', 0, 'showPoP'])).to.equal(true);
            });
        });

        describe(`${Actions.BUCKETS_SET_BUCKET_ITEM_DATE_DATASET} test`, () => {
            it('should set date data set of bucket item', () => {
                const date = fromJS({ attribute: DATE_DATASET_ATTRIBUTE });

                state = state.updateIn(Paths.BUCKETS_FILTERS_ITEMS, items => items.push(date));

                reduce(Actions.BUCKETS_SET_BUCKET_ITEM_DATE_DATASET, { item, value: 'abc' });
                expect(state.getIn(Paths.DATE_DATASETS_SELECTED)).to.equal('abc');
            });
        });

        describe(`${Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY} test`, () => {
            it('should set granularity of bucket item', () => {
                const date = fromJS({ attribute: DATE_DATASET_ATTRIBUTE });

                state = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items'], List.of(date));

                reduce(Actions.BUCKETS_SET_BUCKET_ITEM_GRANULARITY, { item: date, value: 'abc' });
                expect(state.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0, 'granularity'])).to.equal('abc');
            });
        });

        describe(`${Actions.BUCKETS_DND_ITEM_INSERT} test`, () => {
            it('should set active date dataset if item is date and date is not selected', () => {
                const dateDataSets = fromJS([
                    { identifier: 'foo' },
                    { identifier: 'bar' }
                ]);
                state = initialState.setIn(Paths.DATE_DATASETS_AVAILABLE, dateDataSets);

                reduce(Actions.BUCKETS_DND_ITEM_INSERT, {
                    keyName: CATEGORIES,
                    catalogueItem: fromJS({
                        identifier: DATE_DATASET_ATTRIBUTE,
                        type: DATE,
                        title: 'Date'
                    })
                });

                expect(state.getIn(Paths.DATE_DATASETS_SELECTED_ID)).to.eql(dateDataSets.get(0).get('identifier'));
            });
        });
    });
});

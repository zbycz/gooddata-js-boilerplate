import * as ActionTypes from '../../constants/Actions';
import openReducer, { getSelectedDateDataSet } from '../open_reducer';
import initialState from '../initial_state';
import * as StatePaths from '../../constants/StatePaths';
import * as TestMocks from '../../constants/TestMocks';

import { fromJS } from 'immutable';

describe('open_reducer', () => {
    describe(`#${ActionTypes.OPEN_REPORT_FINISHED}`, () => {
        const mdObjectActionPayload = {
            report: {
                content: {
                    type: 'column',
                    buckets: {
                        categories: [],
                        filters: [],
                        measures: []
                    }
                },
                meta: {
                    title: 'foo'
                }
            },
            loadedItems: {
                itemCache: {},
                filterItems: {},
                dateDataSets: {}
            }
        };

        const mdObjectAction = {
            type: ActionTypes.OPEN_REPORT_FINISHED,
            payload: mdObjectActionPayload
        };

        it('should set opening report data into state', () => {
            const result = openReducer(initialState, mdObjectAction);
            const resultData = result.get('data');

            expect(resultData.get('buckets').toJS()).to.eql({
                categories: {
                    items: [],
                    keyName: 'categories'
                },
                filters: {
                    items: [],
                    keyName: 'filters'
                },
                metrics: {
                    items: [],
                    keyName: 'metrics'
                },
                stacks: {
                    items: [],
                    keyName: 'stacks'
                }
            });

            expect(resultData.get('visualizationType')).to.equal('column');
            expect(resultData.get('title')).to.equal('foo');

            expect(result.getIn(StatePaths.REPORT_CONTENT).toJS()).to.eql(mdObjectAction.payload.report.content);
            expect(result.getIn(StatePaths.REPORT_NOW_OPEN)).to.be.ok();
            expect(result.getIn(StatePaths.REPORT_EXECUTION_FIRST)).to.be.ok();
        });

        it('should merge state itemCache with loaded items and set it to state', () => {
            const originalCache = {
                measureInCache: {
                    uri: '/gdc/md/obj/1'
                }
            };
            const stateWithCache = initialState.setIn(StatePaths.ITEM_CACHE, fromJS(originalCache));

            const measureIdentifier = 'loadedMeasure';
            const loadedCache = {
                [measureIdentifier]: {
                    uri: '/gdc/md/obj/2'
                }
            };

            const payload = {
                ...mdObjectActionPayload,
                loadedItems: {
                    itemCache: loadedCache,
                    dateDataSets: {}
                }
            };

            const action = {
                type: ActionTypes.OPEN_REPORT_FINISHED,
                payload
            };

            const result = openReducer(stateWithCache, action);
            const resultCache = result.getIn(StatePaths.ITEM_CACHE);

            expect(resultCache.toJS()).to.eql({
                ...originalCache,
                ...loadedCache
            });
        });

        it('should enable Reset/Clear button after opening report', () => {
            const result = openReducer(initialState, mdObjectAction);
            const isResetPossible = result.getIn(StatePaths.RESET_POSSIBLE);

            expect(isResetPossible).to.equal(true);
        });
    });

    describe('getSelectedDateDataSet', () => {
        it('should return falsy when not in categories nor in filters', () => {
            const buckets = {
                categories: [],
                filters: [],
                measures: []
            };

            expect(getSelectedDateDataSet(buckets, TestMocks.dateDataSetsAvailable)).not.to.be.ok();
        });

        context('should return correct dataset id', () => {
            it('when only in categories', () => {
                const buckets = {
                    categories: TestMocks.metadataBucketCategories,
                    filters: [],
                    measures: []
                };

                expect(getSelectedDateDataSet(buckets, TestMocks.dateDataSetsAvailable)).to.eql(TestMocks.dateDataSetsAvailable[0]);
            });

            it('when only in filters', () => {
                const buckets = {
                    categories: [],
                    filters: TestMocks.metadataBucketFiltersNoSelection,
                    measures: []
                };

                expect(getSelectedDateDataSet(buckets, TestMocks.dateDataSetsAvailable)).to.eql(TestMocks.dateDataSetsAvailable[2]);
            });

            it('when both in categories and filters', () => {
                const buckets = {
                    categories: TestMocks.metadataBucketCategories,
                    filters: TestMocks.metadataBucketFiltersNoSelection,
                    measures: []
                };

                expect(getSelectedDateDataSet(buckets, TestMocks.dateDataSetsAvailable)).to.eql(TestMocks.dateDataSetsAvailable[0]);
            });
        });
    });
});

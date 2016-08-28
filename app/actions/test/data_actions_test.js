import { fromJS } from 'immutable';
import { set } from 'lodash';

import {
    datasetsRequested,
    catalogueItemDetailRequested,
    setCatalogueQuery,
    setCatalogueFilter,
    setActiveCatalogueDataset,
    datasetSelectRequested,
    startCatalogueUpdate,
    catalogueUpdated
} from '../data_actions';

import initialState from '../../reducers/initial_state';
import * as ActionTypes from '../../constants/Actions';

import { createTestLogging } from '../../utils/test_logging';
import { createActionStore } from '../../utils/test_action_store';

describe('Data related actions', () => {
    describe('catalogue filtering', () => {
        const state = fromJS({
            appState: {
                bootstrapData: {
                    project: {
                        id: 'xyz-foo'
                    }
                }
            },

            data: {
                catalogue: {
                    filters: [{
                        types: ['attribute']
                    }],
                    activeFilterIndex: 0,
                    catalogueQuery: 'search string',
                    activeDatasetId: 'my-dataset'
                }
            }
        });

        let dispatch, getState;

        beforeEach(() => {
            dispatch = sinon.stub();
            getState = sinon.stub().returns(state);
        });

        afterEach(() => {
            dispatch.reset();
            getState.reset();
        });

        describe('setCatalogueQuery', () => {
            it('should create action with query', () => {
                let action = setCatalogueQuery('search query');

                expect(action).to.eql({
                    type: 'CATALOGUE_SET_QUERY',
                    payload: {
                        query: 'search query'
                    }
                });
            });
        });

        describe('setCatalogueFilter', () => {
            it('should create action with filter index', () => {
                let action = setCatalogueFilter(1);

                expect(action).to.eql({
                    type: 'CATALOGUE_SET_ACTIVE_FILTER_INDEX',
                    payload: {
                        index: 1
                    }
                });
            });
        });

        describe('setActiveCatalogueDataset', () => {
            it('should create action with active dataset id', () => {
                let action = setActiveCatalogueDataset({ datasetId: 'my.dataset.id' });
                action(dispatch, getState);

                expect(dispatch).to.be.calledWith({
                    type: 'CATALOGUE_SET_ACTIVE_DATASET_ID',
                    payload: { datasetId: 'my.dataset.id' }
                });
            });
        });
    });

    describe('catalogueItemDetailRequested', () => {
        const item = { identifier: 'obj-123' };
        const details = { data: 'item details' };

        it('loads item details from server', () => {
            let loadDetails = sinon.stub().returns(Promise.resolve(details));

            let dispatch = sinon.stub();
            let getState = sinon.stub().returns(initialState);

            let action = catalogueItemDetailRequested(item, loadDetails);

            return action(dispatch, getState).then(() => {
                expect(dispatch).to.be.calledWith({ type: 'ITEM_DETAIL_REQUEST' });

                expect(loadDetails).to.be.calledWith(item);

                expect(dispatch).to.be.calledWith({
                    type: 'ITEM_DETAIL_DATA',
                    payload: {
                        detail: details,
                        itemId: item.identifier
                    }
                });
            });
        });
    });

    describe('datasetsRequested', () => {
        const state = fromJS(set({}, 'appState.bootstrapData.accountSetting.links.self', '/profile/me'));

        it('loads datasets from server', () => {
            let loadDatasets = sinon.stub().returns(Promise.resolve([
                { author: '/profile/me' },
                { author: '/profile/me' },
                { author: '/profile/someone-else' }
            ]));

            let dispatch = sinon.stub();
            let getState = sinon.stub().returns(state);

            let action = datasetsRequested('xyz-foo', loadDatasets);

            return action(dispatch, getState).then(() => {
                expect(loadDatasets).to.be.calledWith('xyz-foo');

                expect(dispatch).to.be.calledWith({
                    type: 'DATASETS_DATA',
                    payload: {
                        datasets: {
                            user: [
                                { author: '/profile/me' },
                                { author: '/profile/me' }
                            ],
                            shared: [
                                { author: '/profile/someone-else' }
                            ]
                        }
                    }
                });
            });
        });
    });

    describe('datasetSelectRequested', () => {
        let windowInstance;

        beforeEach(() => {
            windowInstance = {
                location: {
                    pathname: '/analyze/',
                    hash: '#/goodsales/edit/reportId?dataset=foobar'
                },
                history: {
                    pushState: sinon.stub()
                }
            };
        });

        it('should push new history state', () => {
            datasetSelectRequested(windowInstance, 'dataset.payroll');

            expect(windowInstance.history.pushState).to.be.calledWith(null, null, '/analyze/#/goodsales/edit/reportId?dataset=dataset.payroll');
        });
    });

    describe('startCatalogueUpdate', () => {
        const { log, formatter, findLogEntryByMessage } = createTestLogging();
        const { dispatch } = createActionStore();

        const defaultDeps = { log, formatter };

        it('should log message', () => {
            const action = startCatalogueUpdate(defaultDeps);

            dispatch(action);

            const entry = findLogEntryByMessage(ActionTypes.CATALOGUE_UPDATE_STARTED);

            expect(entry).to.be.ok();
        });
    });

    describe('catalogueUpdated', () => {
        const { log, formatter, findLogEntryByMessage } = createTestLogging();
        const { dispatch } = createActionStore();

        const defaultDeps = { log, formatter };

        it('should log message', () => {
            const payload = {
                initialLoad: true,
                data: {
                    items: [],
                    totalCount: 0
                }
            };
            const action = catalogueUpdated(payload, defaultDeps);

            dispatch(action);

            const entry = findLogEntryByMessage(ActionTypes.CATALOGUE_UPDATE_FINISHED);

            expect(entry).to.be.ok();
        });
    });
});

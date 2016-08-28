import { Map, fromJS } from 'immutable';

import * as Actions from '../../constants/Actions';
import * as StatePaths from '../../constants/StatePaths';
import { FILTER_ALL_DATA } from '../../constants/Datasets';
import dataReducer from '../data_reducer';
import initialState from '../initial_state';

describe('Data Reducer tests', () => {
    describe(`${Actions.CATALOGUE_UPDATE_STARTED} test`, () => {
        it('should set all fields in state correctly', () => {
            // Arrange
            let expectedState = {
                data: {
                    catalogue: {
                        isLoading: true
                    }
                }
            };

            // Act
            let result = dataReducer(Map(), { type: Actions.CATALOGUE_UPDATE_STARTED });

            // Assert
            expect(result.toJS()).to.eql(expectedState);
        });
    });

    describe(`${Actions.CATALOGUE_SET_ACTIVE_DATASET_ID} test`, () => {
        const activeDatasetId = 'whatever-dataset-id';
        const action = {
            type: Actions.CATALOGUE_SET_ACTIVE_DATASET_ID,
            payload: {
                datasetId: activeDatasetId
            }
        };
        const state = dataReducer(
            initialState.setIn([...StatePaths.CATALOGUE_ACTIVE_FILTER_INDEX], 'some-index'), action
        );

        it('should set active dataset id', () => {
            expect(state.getIn([...StatePaths.CATALOGUE_ACTIVE_DATASET_ID])).to.equal(activeDatasetId);
        });

        it('should reset search query', () => {
            expect(state.getIn([...StatePaths.CATALOGUE_QUERY])).to.equal('');
        });

        it('should reset active filter index', () => {
            expect(state.getIn([...StatePaths.CATALOGUE_ACTIVE_FILTER_INDEX])).to.equal(FILTER_ALL_DATA);
        });
    });

    describe(`${Actions.CATALOGUE_UPDATE_FINISHED} test`, () => {
        it('should set all fields in state correctly', () => {
            // Arrange
            let fact = {
                title: 'whatever-title',
                summary: 'whatever-summary',
                identifier: 'whatever-identifier',
                uri: 'whatever-uri',
                type: 'fact',
                id: 'whatever-identifier',
                isAvailable: true,
                dataset: undefined
            };
            let totals = { available: 1 };
            let expectedState = {
                data: {
                    itemCache: { 'whatever-identifier': fact },
                    catalogue: {
                        totals,
                        items: ['whatever-identifier'],
                        isLoading: false
                    }
                }
            };

            // Act
            let result = dataReducer(Map(), {
                type: Actions.CATALOGUE_UPDATE_FINISHED,
                payload: {
                    items: [fact],
                    totals
                }
            });

            // Assert
            expect(result.toJS()).to.eql(expectedState);
        });
    });

    describe(`${Actions.CATALOGUE_SET_ACTIVE_FILTER_INDEX} test`, () => {
        const activeFilterIndex = 'whatever-index';
        const action = {
            type: Actions.CATALOGUE_SET_ACTIVE_FILTER_INDEX,
            payload: {
                index: activeFilterIndex
            }
        };
        const state = dataReducer(initialState, action);

        it('should set active filter index', () => {
            expect(state.getIn([...StatePaths.CATALOGUE_ACTIVE_FILTER_INDEX])).to.equal(activeFilterIndex);
        });

        it('should reset search query', () => {
            expect(state.getIn([...StatePaths.CATALOGUE_QUERY])).to.equal('');
        });
    });

    describe(`${Actions.CATALOGUE_SET_QUERY} test`, () => {
        it('should set all fields in state correctly', () => {
            const query = 'whatever-query';
            const action = {
                type: Actions.CATALOGUE_SET_QUERY,
                payload: {
                    query
                }
            };

            const state = dataReducer(initialState, action);

            expect(state.getIn([...StatePaths.CATALOGUE_QUERY])).to.equal(query);
        });
    });

    describe(`${Actions.ITEM_DETAIL_DATA} test`, () => {
        it('should set all fields in state correctly', () => {
            // Arrange
            let identifier = 'whatever-identifier';
            let state = {
                data: {
                    itemCache: {
                        'other-identifier': { identifier: 'other-identifier' },
                        'whatever-identifier': { identifier }
                    }
                }
            };
            let detail = { whatever: 'whatever-value' };
            let expectedState = {
                data: {
                    itemCache: {
                        'other-identifier': { identifier: 'other-identifier' },
                        'whatever-identifier': { identifier, details: detail }
                    }
                }
            };

            // Act
            let result = dataReducer(fromJS(state), {
                type: Actions.ITEM_DETAIL_DATA,
                payload: {
                    itemId: identifier,
                    detail
                }
            });

            // Assert
            expect(result.toJS()).to.eql(expectedState);
        });
    });

    describe(`${Actions.DATASETS_DATA} test`, () => {
        it('should set all fields in state correctly', () => {
            // Arrange
            let datasets = [{ whatever: 'whatever-value-1' }, { whatever: 'whatever-value-2' }];
            let expectedState = {
                data: {
                    datasets
                }
            };

            // Act
            let result = dataReducer(Map(), {
                type: Actions.DATASETS_DATA,
                payload: {
                    datasets
                }
            });

            // Assert
            expect(result.toJS()).to.eql(expectedState);
        });
    });

    describe(`${Actions.DATE_DATASETS_DATA} test`, () => {
        const dateDataSets = {
            available: [{ id: 'whatever-value-1' }, { id: 'whatever-value-2' }],
            unavailable: 2
        };

        it('should update data datasets data', () => {
            // Act
            const result = dataReducer(Map(), {
                type: Actions.DATE_DATASETS_DATA,
                payload: dateDataSets
            }).getIn(StatePaths.DATE_DATASETS).toJS();

            // Assert
            expect(result.available).to.eql(dateDataSets.available);
            expect(result.unavailable).to.eql(dateDataSets.unavailable);
        });

        it('should preserve currently selected date dataset if available', () => {
            // Act
            const result = dataReducer(fromJS({ data: { dateDataSets: { dateDataSet: 'whatever-value-2' } } }), {
                type: Actions.DATE_DATASETS_DATA,
                payload: dateDataSets
            }).getIn(StatePaths.DATE_DATASETS).toJS();

            // Assert
            expect(result.dateDataSet).to.eql('whatever-value-2');
        });

        it('should preserve currently selected date dataset even if not available', () => {
            const selectedDataSetId = 'whatever-value-5';

            const result = dataReducer(fromJS({ data: { dateDataSets: {
                available: [{ id: selectedDataSetId }],
                dateDataSet: selectedDataSetId
            } } }), {
                type: Actions.DATE_DATASETS_DATA,
                payload: dateDataSets
            }).getIn(StatePaths.DATE_DATASETS).toJS();

            expect(result.dateDataSet).to.eql(selectedDataSetId);
        });

        it('should not have duplicate datasets in the list', () => {
            const selectedDataSetId = 'whatever-value-1';

            const result = dataReducer(fromJS({ data: { dateDataSets: {
                available: [{ id: selectedDataSetId }],
                dateDataSet: selectedDataSetId
            } } }), {
                type: Actions.DATE_DATASETS_DATA,
                payload: dateDataSets
            }).getIn(StatePaths.DATE_DATASETS).toJS();

            expect(result.available).to.eql(dateDataSets.available);
        });

        it('should have not set selected dataset automatically', () => {
            const result = dataReducer(fromJS({ data: { dateDataSets: {
                available: dateDataSets.available,
                dateDataSet: null
            } } }), {
                type: Actions.DATE_DATASETS_DATA,
                payload: dateDataSets
            }).getIn(StatePaths.DATE_DATASETS_SELECTED);

            expect(result).to.eql(null);
        });
    });
});

import * as ActionTypes from '../../constants/Actions';

import deleteReducer from '../delete_reducer';
import { __RewireAPI__ as TimeTravelReducerRewireApi } from '../time_travel_reducer';

import initialState from '../initial_state';
import * as StatePaths from '../../constants/StatePaths';
import { fromJS } from 'immutable';

describe('delete_reducer', () => {
    describe(`#${ActionTypes.DELETE_REPORT_STARTED}`, () => {
        let deleteAction;

        beforeEach(() => {
            deleteAction = {
                type: ActionTypes.DELETE_REPORT_STARTED
            };
        });

        it('should set opening report data into state', () => {
            const result = deleteReducer(initialState, deleteAction);
            expect(result.getIn(StatePaths.DIALOGS_DELETE_REPORT_CONFIRMATION_ACTIVE)).to.equal(false);
        });

        it('should reset application when deleting active report', () => {
            deleteAction.payload = fromJS({
                meta: {
                    uri: 'foo'
                }
            });
            const changedState = initialState
                .setIn(StatePaths.REPORT_LAST_SAVED_OBJECT, fromJS({
                    visualization: {
                        meta: {
                            title: 'last saved',
                            uri: 'foo'
                        },
                        content: {}
                    }
                }));

            const result = deleteReducer(changedState, deleteAction);

            expect(result.getIn(StatePaths.REPORT_LAST_SAVED_OBJECT)).to.equal(initialState.getIn(StatePaths.REPORT_LAST_SAVED_OBJECT));
        });

        context('clearing history', () => {
            let pastStates, futureStates;

            const uriToBeRemoved = 'uriToBeRemoved';
            const lastSavedObjectFn = uri => fromJS({ visualization: { content: {}, meta: { uri } } });

            const addState =
                (states, newState) => states.push({ state: newState, actionType: 'foo' });

            const createState =
                uri => initialState.setIn(StatePaths.REPORT_LAST_SAVED_OBJECT, lastSavedObjectFn(uri));

            beforeEach(() => {
                pastStates = [];
                futureStates = [];

                TimeTravelReducerRewireApi.__Rewire__('pastStates', pastStates);
                TimeTravelReducerRewireApi.__Rewire__('futureStates', futureStates);

                addState(pastStates, createState('someOtherUri01'));
                addState(pastStates, createState(uriToBeRemoved));
                addState(futureStates, createState(uriToBeRemoved));
                addState(futureStates, createState('someOtherUri02'));
            });

            afterEach(() => {
                TimeTravelReducerRewireApi.__ResetDependency__('pastStates');
                TimeTravelReducerRewireApi.__ResetDependency__('futureStates');
            });

            it(`should remove deleted insight from ${StatePaths.REPORT_LAST_SAVED_OBJECT} of both future and past states`, () => {
                deleteReducer(initialState, {
                    type: ActionTypes.DELETE_REPORT_STARTED,
                    payload: fromJS({ meta: { uri: uriToBeRemoved } })
                });

                const statesWithDeletedUri = [...pastStates, ...futureStates]
                    .filter(wrappedState => wrappedState.state.getIn(StatePaths.REPORT_SAVED_URI) === uriToBeRemoved);

                expect(statesWithDeletedUri).to.be.empty();
            });
        });
    });
});

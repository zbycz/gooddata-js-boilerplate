import * as ActionTypes from '../../constants/Actions';
import * as Paths from '../../constants/StatePaths';
import timeTravelReducer, {
    whitelistedActions,
    updateHistory,
    isResetDisabledByLastAction,
    __RewireAPI__ as TimeTravelReducerRewireApi
} from '../time_travel_reducer';
import saveReducer from '../save_reducer';
import openReducer from '../open_reducer';
import appContextReducer from '../app_context_reducers';
import initialState from '../initial_state';
import { compose } from '../../utils/reducers';
import { fromJS } from 'immutable';

describe('timeTravelReducer', () => {
    let pastStates;
    let futureStates;
    let state;
    let isResetAllowed;

    const ignoredActions = Object.keys(ActionTypes)
        .map(key => ActionTypes[key])
        .filter(type => !whitelistedActions.find(a => a === type));

    function reduce(action) {
        state = timeTravelReducer(
            state, action, pastStates, futureStates, isResetAllowed
        );
    }

    beforeEach(() => {
        pastStates = [];
        futureStates = [];

        state = initialState;
    });

    function addPreviousState(previousState, actionType = 'foo') {
        pastStates.push({
            state: previousState,
            actionType
        });
    }

    function addFutureState(futureState, actionType = 'foo') {
        futureStates.push({
            state: futureState,
            actionType
        });
    }

    describe('Ignored actions', () => {
        ignoredActions.forEach(type => {
            it(`should ignore ${type} [not whitelisted]`, () => {
                const action = { type };

                reduce(action);

                expect(pastStates.length).to.equal(0);
                expect(futureStates.length).to.equal(0);
            });
        });
    });

    describe('All but ignored actions', () => {
        whitelistedActions.forEach(type => {
            it(`should keep track of ${type} being applied`, () => {
                const action = { type };

                reduce(action);

                expect(pastStates.length).to.equal(1);
                expect(futureStates.length).to.equal(0);
            });

            it('should make undo possible', () => {
                const action = { type };

                reduce(action);

                expect(state.getIn(Paths.UNDO_POSSIBLE)).to.equal(true);
            });
        });
    });

    describe(`#${ActionTypes.UNDO_ACTION}`, () => {
        beforeEach(() => {
            addPreviousState(
                initialState.set('position', 'past')
                            .setIn(Paths.ACTIVE_DRAG_ITEM, 'item')
            );
        });

        it('should remove action from previous actions', () => {
            const action = { type: ActionTypes.UNDO_ACTION };

            reduce(action);

            expect(pastStates.length).to.equal(0);
        });

        it('should add action to future actions', () => {
            const action = { type: ActionTypes.UNDO_ACTION };

            reduce(action);

            expect(futureStates.length).to.equal(1);
        });

        it('should make redo possible', () => {
            const action = { type: ActionTypes.UNDO_ACTION };

            reduce(action);

            expect(state.getIn(Paths.REDO_POSSIBLE)).to.equal(true);
        });

        it('should result in past state', () => {
            const action = { type: ActionTypes.UNDO_ACTION };

            reduce(action);

            expect(state.get('position')).to.equal('past');
        });

        it('should copy last saved report from previous state', () => {
            const expectedContent = { foo: 'bar' };
            state = state.setIn(Paths.REPORT_CONTENT, fromJS(expectedContent));

            const action = { type: ActionTypes.UNDO_ACTION };

            reduce(action);

            expect(state.getIn(Paths.REPORT_CONTENT).toJS()).to.eql(expectedContent);
        });

        it('should reset active dragged item in state', () => {
            const action = { type: ActionTypes.UNDO_ACTION };
            state = state.setIn(Paths.ACTIVE_DRAG_ITEM, fromJS({ foo: 'bar' }));
            reduce(action);

            expect(state.getIn(Paths.ACTIVE_DRAG_ITEM)).not.to.be.ok();
        });

        it('should not copy last saved report from previous state when actionType is RESET_APPLICATION', () => {
            addPreviousState(
                initialState,
                ActionTypes.RESET_APPLICATION
            );

            state = state
                .setIn(Paths.REPORT_SAVED_URI, 'foo')
                .setIn(Paths.REPORT_CONTENT, true);

            const action = { type: ActionTypes.UNDO_ACTION };

            reduce(action);

            expect(state.getIn(Paths.REPORT_SAVED_URI)).not.to.be.ok();
        });

        it('should reset shortcut dropped item in state', () => {
            const action = { type: ActionTypes.UNDO_ACTION };
            state = state.setIn(Paths.SHORTCUT_DROPPED_ITEM, fromJS({ foo: 'bar' }));
            reduce(action);

            expect(state.getIn(Paths.SHORTCUT_DROPPED_ITEM)).not.to.be.ok();
        });
    });

    describe(`#${ActionTypes.REDO_ACTION}`, () => {
        beforeEach(() => {
            addFutureState(initialState.set('position', 'future'));
        });

        it('should add action to previous actions', () => {
            const action = { type: ActionTypes.REDO_ACTION };

            reduce(action);

            expect(pastStates.length).to.equal(1);
        });

        it('should remove action from future actions', () => {
            const action = { type: ActionTypes.REDO_ACTION };

            reduce(action);

            expect(futureStates.length).to.equal(0);
        });

        it('should make undo possible', () => {
            const action = { type: ActionTypes.REDO_ACTION };

            reduce(action);

            expect(state.getIn(Paths.UNDO_POSSIBLE)).to.equal(true);
        });

        it('should result in future state', () => {
            const action = { type: ActionTypes.REDO_ACTION };

            reduce(action);

            expect(state.get('position')).to.equal('future');
        });

        it('should copy last saved report from previous state', () => {
            const expectedContent = { foo: 'bar' };
            state = state.setIn(Paths.REPORT_CONTENT, fromJS(expectedContent));

            const action = { type: ActionTypes.REDO_ACTION };

            reduce(action);

            expect(state.getIn(Paths.REPORT_CONTENT).toJS()).to.eql(expectedContent);
        });

        it('should not copy last saved report from future state when actionType is RESET_APPLICATION', () => {
            addFutureState(
                initialState,
                ActionTypes.RESET_APPLICATION
            );

            state = state
                .setIn(Paths.REPORT_SAVED_URI, 'foo')
                .setIn(Paths.REPORT_CONTENT, true);

            const action = { type: ActionTypes.REDO_ACTION };

            reduce(action);

            expect(state.getIn(Paths.REPORT_SAVED_URI)).not.to.be.ok();
        });
    });

    describe(`#${ActionTypes.SAVE_REPORT_FINISHED}`, () => {
        context('after performing a whitelisted action', () => {
            beforeEach(() => {
                reduce({ type: whitelistedActions[0] });

                expect(state.getIn(Paths.UNDO_POSSIBLE)).to.equal(true);
            });

            it('should disable undo and clear past', () => {
                reduce({
                    type: ActionTypes.SAVE_REPORT_FINISHED,
                    payload: {
                        saveAsNew: true
                    }
                });

                expect(pastStates.length).to.equal(0);
                expect(state.getIn(Paths.UNDO_POSSIBLE)).to.equal(false);
            });

            it('should not disable undo and not clear past when not save as new', () => {
                reduce({ type: ActionTypes.SAVE_REPORT_FINISHED });

                expect(pastStates.length).not.to.equal(0);
                expect(state.getIn(Paths.UNDO_POSSIBLE)).to.equal(true);
            });
        });
    });

    describe(`#${ActionTypes.OPEN_REPORT_FINISHED}`, () => {
        context('after performing a whitelisted action', () => {
            beforeEach(() => {
                reduce({ type: whitelistedActions[0] });

                expect(state.getIn(Paths.UNDO_POSSIBLE)).to.equal(true);
            });

            it('should disable undo and clear past', () => {
                reduce({ type: ActionTypes.OPEN_REPORT_FINISHED });

                expect(pastStates.length).to.equal(0);
                expect(state.getIn(Paths.UNDO_POSSIBLE)).to.equal(false);
            });
        });
    });

    describe(`#${ActionTypes.APP_READINESS_CHANGE}`, () => {
        context('after performing a whitelisted action', () => {
            beforeEach(() => {
                reduce({ type: whitelistedActions[0] });

                expect(state.getIn(Paths.UNDO_POSSIBLE)).to.equal(true);
            });

            it('should disable undo and clear past', () => {
                reduce({ type: ActionTypes.APP_READINESS_CHANGE, payload: { isReady: true } });

                expect(pastStates.length).to.equal(0);
                expect(state.getIn(Paths.UNDO_POSSIBLE)).to.equal(false);
            });
        });
    });

    describe('e2e', () => {
        const reducers = [
            timeTravelReducer,
            appContextReducer,
            saveReducer,
            openReducer
        ];

        function complexReduce(action) {
            state = compose(reducers)(
                state, action, pastStates, futureStates
            );
        }

        it('should not allow redo after undo and another actions are applied', () => {
            reduce({ type: ActionTypes.BUCKETS_DND_ITEM_INSERT });
            reduce({ type: ActionTypes.UNDO_ACTION });
            reduce({ type: ActionTypes.BUCKETS_DND_ITEM_INSERT });

            expect(futureStates.length).to.equal(0);
        });

        it('should preserve lastSavedReportContent after actions: open, reset, undo', () => {
            const mdObject = {
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

            complexReduce({
                type: ActionTypes.OPEN_REPORT_FINISHED,
                payload: mdObject
            });

            complexReduce({ type: ActionTypes.RESET_APPLICATION });

            expect(state.getIn(Paths.REPORT_CONTENT)).to.equal(null);

            complexReduce({ type: ActionTypes.UNDO_ACTION });

            expect(state.getIn(Paths.REPORT_CONTENT).toJS()).to.eql(mdObject.report.content);
        });

        it('should preserve lastSavedReportContent afte actions: save, undo', () => {
            const myContent = { foo: 'bar' };

            complexReduce({ type: ActionTypes.REPORT_TITLE_CHANGE });

            expect(pastStates.length).to.equal(1);

            complexReduce({
                type: ActionTypes.SAVE_REPORT_FINISHED,
                payload: {
                    reportMDObject: { visualization: { content: myContent } },
                    saveAsNew: false
                }
            });

            expect(pastStates.length).to.equal(1);

            complexReduce({ type: ActionTypes.UNDO_ACTION });

            expect(pastStates.length).to.equal(0);
            expect(state.getIn(Paths.REPORT_CONTENT).toJS()).to.eql(myContent);
        });
    });

    describe('updateHistory', () => {
        beforeEach(() => {
            addPreviousState(fromJS({ id: '1' }));
            addPreviousState(fromJS({ id: '2' }));
            addFutureState(fromJS({ id: '3' }));
            addFutureState(fromJS({ id: '4' }));
        });

        it('should use update callback to update states in history that satisfy the where conditional', () => {
            const dummyState = fromJS({});
            const update = sinon.spy(() => dummyState);
            const where = sinon.spy(_state => _state.get('id') === '2');
            const states = [...pastStates, ...futureStates];

            updateHistory(update, where, states);

            expect(states[0].state).not.to.equal(dummyState);
            expect(states[1].state).to.equal(dummyState);
            expect(states[2].state).not.to.equal(dummyState);
            expect(states[3].state).not.to.equal(dummyState);
        });
    });

    describe('isResetDisabledByLastAction', () => {
        it('should not allow to reset application when last state was reset', () => {
            TimeTravelReducerRewireApi.__Rewire__('pastStates', pastStates);
            addPreviousState(
                initialState,
                ActionTypes.RESET_APPLICATION
            );

            expect(isResetDisabledByLastAction()).to.be.true();
            TimeTravelReducerRewireApi.__ResetDependency__('pastStates');
        });
    });
});

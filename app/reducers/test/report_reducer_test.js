import { fromJS } from 'immutable';
import reportReducer from '../report_reducer';
import { __RewireAPI__ as TimeTravelReducerRewireApi } from '../time_travel_reducer';

import * as Actions from '../../constants/Actions';
import * as StatePaths from '../../constants/StatePaths';
import { DATA_TOO_LARGE_TO_DISPLAY } from '../../constants/Errors';
import initialState from '../../reducers/initial_state';

describe('ReportReducer', () => {
    const expectEqual = (actual, expected) => {
        expect(actual.toJS()).to.eql(expected.toJS());
    };

    describe('execution', () => {
        describe('start', () => {
            it('sets running and id on execution start', () => {
                const state = running => fromJS({
                    report: {
                        execution: {
                            running
                        }
                    }
                });

                let original = state(false);
                let expected = state(true).setIn(['report', 'execution', 'id'], 1);

                let action = { type: Actions.REPORT_EXECUTION_STARTED, meta: { id: 1 } };

                let reportState = reportReducer(original, action);

                expectEqual(reportState, expected);
            });

            it('deletes data from previous executions', () => {
                let original = fromJS({
                    report: {
                        execution: {
                            data: {
                                headers: 'foo'
                            }
                        }
                    }
                });

                let expected = fromJS({
                    report: {
                        execution: {
                            running: true,
                            id: 1
                        }
                    }
                });

                let action = { type: Actions.REPORT_EXECUTION_STARTED, meta: { id: 1 } };

                let reportState = reportReducer(original, action);

                expectEqual(reportState, expected);
            });
        });

        describe('error', () => {
            it('should not update state if execution ids differ', () => {
                const state = initialState.setIn(StatePaths.REPORT_EXECUTION_ID, 123);
                const action = {
                    type: Actions.REPORT_EXECUTION_ERROR,
                    meta: {
                        id: 456
                    }
                };

                const reportState = reportReducer(state, action);
                expectEqual(reportState, state);
            });
        });

        describe('finish', () => {
            const paydateHeaderItem = {
                id: 'paydate.aag81lMifn6q',
                title: 'Year (Paydate)',
                type: 'attrLabel',
                uri: '/gdc/md/project/obj/1'
            };

            const data = {
                dateDataSets: {
                    available: []
                }
            };

            const payload = { headers: [paydateHeaderItem] };

            const action = { type: Actions.REPORT_EXECUTION_FINISHED, payload, meta: { id: 1 } };

            it('should not update state if execution ids differ', () => {
                let original = fromJS({
                    report: {
                        execution: {
                            id: 2,
                            running: true
                        }
                    },
                    data
                });

                let reportState = reportReducer(original, action);

                expectEqual(reportState, original);
            });

            it('sets running to false and attaches data', () => {
                let original = fromJS({
                    report: {
                        execution: {
                            id: 1,
                            running: true
                        }
                    },
                    data
                });

                let expected = fromJS({
                    report: {
                        execution: {
                            id: 1,
                            running: false,
                            first: false,
                            data: {
                                headers: [
                                    paydateHeaderItem
                                ]
                            }
                        },
                        nowOpen: false
                    },
                    data
                });

                let reportState = reportReducer(original, action);

                expectEqual(reportState, expected);
            });

            it('sets first execution flag to true if new open flag is true', () => {
                let original = fromJS({
                    report: {
                        execution: {
                            id: 1,
                            running: true,
                            first: false
                        },
                        nowOpen: true
                    },
                    data
                });

                let expected = fromJS({
                    report: {
                        execution: {
                            id: 1,
                            running: false,
                            first: true,
                            data: {
                                headers: [
                                    paydateHeaderItem
                                ]
                            }
                        },
                        nowOpen: false
                    },
                    data
                });

                let reportState = reportReducer(original, action);

                expectEqual(reportState, expected);
            });

            describe('when user has clicked undo or redo during execution', () => {
                let pastStates, futureStates, original;

                const addState =
                    (states, newState) => states.push({ state: newState, actionType: 'foo' });

                const createState =
                    id => original.setIn(StatePaths.REPORT_EXECUTION_ID, id);

                beforeEach(() => {
                    pastStates = [];
                    futureStates = [];

                    original = fromJS({
                        report: {
                            execution: {
                                id: 5,
                                running: true
                            }
                        },
                        data
                    });

                    TimeTravelReducerRewireApi.__Rewire__('pastStates', pastStates);
                    TimeTravelReducerRewireApi.__Rewire__('futureStates', futureStates);

                    addState(pastStates, createState(1));
                    addState(pastStates, createState(2));
                    addState(futureStates, createState(3));
                    addState(futureStates, createState(4));
                });

                afterEach(() => {
                    TimeTravelReducerRewireApi.__ResetDependency__('pastStates');
                    TimeTravelReducerRewireApi.__ResetDependency__('futureStates');
                });

                it('should update state in history with data', () => {
                    const expected = fromJS({
                        report: {
                            execution: {
                                id: 1,
                                running: false,
                                first: false,
                                data: {
                                    headers: [
                                        paydateHeaderItem
                                    ]
                                }
                            },
                            nowOpen: false
                        },
                        data
                    });

                    const reportState = reportReducer(original, action);
                    expectEqual(reportState, original);

                    expectEqual(pastStates[0].state, expected);
                });
            });
        });
    });

    describe('reportTitleChanged', () => {
        it('shall change report title', () => {
            const myTitle = 'My report title';
            const original = fromJS({
                data: {
                    title: ''
                }
            });
            const expected = fromJS({
                data: {
                    title: myTitle
                }
            });
            const action = {
                type: Actions.REPORT_TITLE_CHANGE,
                payload: {
                    title: myTitle
                }
            };
            const state = reportReducer(original, action);

            expectEqual(state, expected);
        });
    });

    describe('reportTooLargeToDisplay', () => {
        it('should set execution error status flag', () => {
            const action = {
                type: Actions.REPORT_EXECUTION_TOO_LARGE_TO_DISPLAY
            };
            const state = reportReducer(initialState, action);
            const status = state.getIn(StatePaths.REPORT_EXECUTION_ERROR).get('status');
            expect(status).to.eql(DATA_TOO_LARGE_TO_DISPLAY);
        });
    });
});

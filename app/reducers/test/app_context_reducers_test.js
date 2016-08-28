import { fromJS } from 'immutable';
import reducer from '../app_context_reducers';
import initialState from '../initial_state';
import * as Actions from '../../constants/Actions';
import * as StatePaths from '../../constants/StatePaths';
import * as Errors from '../../constants/Errors';
import { INITIAL_MODEL } from '../../models/date_dataset';
import { bootstrapError, loggedOut } from '../../actions/app_context_actions';

describe('app context reducers', () => {
    describe('changeAppReadiness', () => {
        it('should flip app readiness', () => {
            let getAppReady = state => state.getIn(StatePaths.APP_READY);

            expect(getAppReady(initialState)).to.equal(false);

            let appReadyState = reducer(initialState, {
                type: Actions.APP_READINESS_CHANGE,
                payload: { isReady: true }
            });
            expect(getAppReady(appReadyState)).to.equal(true);

            let appNotReadyState = reducer(appReadyState, {
                type: Actions.APP_READINESS_CHANGE,
                payload: { isReady: false }
            });
            expect(getAppReady(appNotReadyState)).to.equal(false);
        });
    });

    describe('changeProject', () => {
        it('should call resetApplication', () => {
            const resetApplication = sinon.stub().returns(initialState);
            reducer.__Rewire__('resetApplication', resetApplication);

            reducer(initialState, { type: Actions.CHANGE_PROJECT });
            expect(resetApplication).to.be.calledOnce();

            reducer.__ResetDependency__('resetApplication');
        });

        it('should disable undo & redo', () => {
            const state = initialState.setIn(StatePaths.UNDO_POSSIBLE, true)
                                    .setIn(StatePaths.REDO_POSSIBLE, true);
            const changedState = reducer(state, { type: Actions.CHANGE_PROJECT });

            expect(changedState.getIn(StatePaths.UNDO_POSSIBLE)).to.equal(false);
            expect(changedState.getIn(StatePaths.REDO_POSSIBLE)).to.equal(false);
        });

        it('should reset date datasets', () => {
            const state = initialState
                .setIn(StatePaths.DATE_DATASETS_AVAILABLE, ['foo', 'bar']);

            const changedState = reducer(state, { type: Actions.CHANGE_PROJECT });

            expect(changedState
                .getIn(StatePaths.DATE_DATASETS)).to.eql(INITIAL_MODEL);
        });
    });

    describe('resetApplication', () => {
        const getReportExecutionData = state => state.getIn(StatePaths.REPORT_EXECUTION_DATA);

        it('should reset report', () => {
            expect(getReportExecutionData(initialState)).to.equal(null);

            const changedState = initialState.setIn(StatePaths.REPORT_EXECUTION_DATA, true);
            expect(getReportExecutionData(changedState)).to.equal(true);

            const resettedState = reducer(changedState, {
                type: Actions.RESET_APPLICATION
            });
            expect(getReportExecutionData(resettedState)).to.equal(null);
        });

        it('should reset selected dimension', () => {
            const changedState = initialState.setIn(StatePaths.DATE_DATASETS_SELECTED, fromJS({ identifier: 'selected.date' }));

            const resettedState = reducer(changedState, {
                type: Actions.RESET_APPLICATION
            });

            expect(resettedState.getIn(StatePaths.DATE_DATASETS_SELECTED)).to.equal(null);
        });

        it('should reset report title', () => {
            const defaultTitle = initialState.getIn(StatePaths.REPORT_CURRENT_TITLE);
            const changedState = initialState.setIn(StatePaths.REPORT_CURRENT_TITLE, 'new title');

            const resettedState = reducer(changedState, {
                type: Actions.RESET_APPLICATION
            });

            expect(resettedState.getIn(StatePaths.REPORT_CURRENT_TITLE)).to.equal(defaultTitle);
        });

        it('should reset last saved object', () => {
            const defaultLastSaved = initialState.getIn(StatePaths.REPORT_LAST_SAVED_OBJECT);
            const changedState = initialState.setIn(StatePaths.REPORT_LAST_SAVED_OBJECT, {
                visualization: {
                    meta: {
                        title: 'last saved'
                    },
                    content: {}
                }
            });

            const resettedState = reducer(changedState, {
                type: Actions.RESET_APPLICATION
            });

            expect(resettedState.getIn(StatePaths.REPORT_LAST_SAVED_OBJECT)).to.equal(defaultLastSaved);
        });

        it('should disable reset button', () => {
            const changedState = initialState.setIn(StatePaths.RESET_POSSIBLE, true);

            const resettedState = reducer(changedState, {
                type: Actions.RESET_APPLICATION
            });

            expect(resettedState.getIn(StatePaths.RESET_POSSIBLE)).to.equal(false);
        });

        it('should reset first execution and new open flag', () => {
            const changedState = initialState
                .setIn(StatePaths.REPORT_EXECUTION_FIRST, false)
                .setIn(StatePaths.REPORT_NOW_OPEN, true);

            const resettedState = reducer(changedState, {
                type: Actions.RESET_APPLICATION
            });

            expect(resettedState.getIn(StatePaths.REPORT_EXECUTION_FIRST)).to.equal(true);
            expect(resettedState.getIn(StatePaths.REPORT_NOW_OPEN)).to.equal(false);
        });
    });

    describe('security', () => {
        let state, isSso, payload, location;

        describe('bootstrapError', () => {
            beforeEach(() => {
                location = {};

                payload = {
                    error: {},
                    projectId: 'my-project-123',
                    location
                };
            });

            const expectError = (error, uri) => {
                payload.error.type = error;
                payload.location.href = '/analyze';
                const newState = reducer(state, bootstrapError(payload), isSso);

                if (uri) {
                    expect(location.href).to.equal(uri);
                } else {
                    expect(newState.getIn([...StatePaths.ERRORS, 0])).to.eql({ type: error });
                }
            };

            describe('standard login mode, non-embedded', () => {
                beforeEach(() => {
                    isSso = () => false;
                    state = initialState;
                });

                it('should redirect to account page if user is not authenticated', () => {
                    expectError(Errors.NOT_AUTHENTICATED_ERROR, '/account.html?lastUrl=%2Fanalyze');
                });

                it('should redirect to account page if user is not authorized', () => {
                    expectError(Errors.NOT_AUTHORIZED_ERROR, '/projects.html#status=notAuthorized');
                });

                it('should redirect to project page if user cannot access workbench', () => {
                    expectError(Errors.ACCESS_WORKBENCH_DENIED_ERROR, '/projects.html#status=cannotAccessWorkbench');
                });

                it('should redirect to dashboard if user has analyticalDesigner flag disabled', () => {
                    expectError(Errors.ACCESS_DESIGNER_DENIED_ERROR, '/#s=/gdc/projects/my-project-123|projectDashboardPage');
                });

                it('should redirect to dashboard if user cannot create report', () => {
                    expectError(Errors.CREATE_REPORT_DENIED_ERROR, '/#s=/gdc/projects/my-project-123|projectDashboardPage');
                });

                it('should store other errors in state and not redirect', () => {
                    expectError(Errors.PROJECT_NOT_FOUND_ERROR);
                    expectError(Errors.NO_PROJECT_AVAILABLE_ERROR);
                });
            });

            describe('standard login mode, embedded', () => {
                beforeEach(() => {
                    isSso = () => false;
                    state = initialState.setIn(StatePaths.IS_EMBEDDED, true);
                });

                it('should redirect to account page if user is not authenticated', () => {
                    expectError(Errors.NOT_AUTHENTICATED_ERROR, '/account.html?lastUrl=%2Fanalyze');
                });

                it('should redirect to info page if user is not authorized', () => {
                    expectError(Errors.NOT_AUTHORIZED_ERROR);
                });

                it('should store error if user cannot access workbench', () => {
                    expectError(Errors.ACCESS_WORKBENCH_DENIED_ERROR);
                });

                it('should redirect to dashboard if user has analyticalDesigner flag disabled', () => {
                    expectError(Errors.ACCESS_DESIGNER_DENIED_ERROR);
                });

                it('should redirect to dashboard if user cannot create report', () => {
                    expectError(Errors.CREATE_REPORT_DENIED_ERROR);
                });

                it('should return other errors in state and not redirect', () => {
                    expectError(Errors.PROJECT_NOT_FOUND_ERROR);
                    expectError(Errors.NO_PROJECT_AVAILABLE_ERROR);
                });
            });

            describe('SSO mode, non-embedded', () => {
                beforeEach(() => {
                    isSso = () => true;
                    state = initialState;
                });

                it('should redirect to account page if user is not authenticated', () => {
                    expectError(Errors.NOT_AUTHENTICATED_ERROR, '/account.html#/info/ssoUnauthorized');
                });

                it('should redirect to account page if user is not authorized', () => {
                    expectError(Errors.NOT_AUTHORIZED_ERROR, '/account.html#/info/ssoUnauthorized');
                });

                it('should redirect to project page if user cannot access workbench', () => {
                    expectError(Errors.ACCESS_WORKBENCH_DENIED_ERROR, '/account.html#/info/ssoUnauthorized');
                });

                it('should redirect to dashboard if user has analyticalDesigner flag disabled', () => {
                    expectError(Errors.ACCESS_DESIGNER_DENIED_ERROR, '/#s=/gdc/projects/my-project-123|projectDashboardPage');
                });

                it('should redirect to dashboard if user cannot create report', () => {
                    expectError(Errors.CREATE_REPORT_DENIED_ERROR, '/#s=/gdc/projects/my-project-123|projectDashboardPage');
                });

                it('should store other errors in state and not redirect', () => {
                    expectError(Errors.PROJECT_NOT_FOUND_ERROR);
                    expectError(Errors.NO_PROJECT_AVAILABLE_ERROR);
                });
            });

            describe('SSO mode, embedded', () => {
                beforeEach(() => {
                    isSso = () => true;
                    state = initialState.setIn(StatePaths.IS_EMBEDDED, true);
                });

                it('should store error if user is not authenticated', () => {
                    expectError(Errors.NOT_AUTHENTICATED_ERROR, '/account.html#/info/ssoUnauthorized');
                });

                it('should redirect to info page if user is not authorized and app is embedded', () => {
                    expectError(Errors.NOT_AUTHORIZED_ERROR, '/account.html#/info/ssoUnauthorized');
                });

                it('should store error if user cannot access workbench', () => {
                    expectError(Errors.ACCESS_WORKBENCH_DENIED_ERROR, '/account.html#/info/ssoUnauthorized');
                });

                it('should redirect to dashboard if user has analyticalDesigner flag disabled', () => {
                    expectError(Errors.ACCESS_DESIGNER_DENIED_ERROR);
                });

                it('should redirect to dashboard if user cannot create report', () => {
                    expectError(Errors.CREATE_REPORT_DENIED_ERROR);
                });

                it('should return other errors in state and not redirect', () => {
                    expectError(Errors.PROJECT_NOT_FOUND_ERROR);
                    expectError(Errors.NO_PROJECT_AVAILABLE_ERROR);
                });
            });
        });

        describe('loggedOut', () => {
            beforeEach(() => {
                location = {};
                payload = { location };
            });

            const expectHref = uri => {
                payload.location.href = '/analyze';
                reducer(state, loggedOut(payload), isSso);

                expect(location.href).to.equal(uri);
            };

            describe('standard login mode', () => {
                beforeEach(() => {
                    isSso = () => false;
                });

                it('should redirect to root', () => {
                    expectHref('/');
                });
            });

            describe('SSO mode', () => {
                beforeEach(() => {
                    isSso = () => true;
                });

                it('should redirect to SSO logout page', () => {
                    expectHref('/account.html#/info/logout');
                });
            });
        });
    });
});

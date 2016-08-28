import $ from 'jquery';
import Promise from 'bluebird';
import { get, set, identity, noop } from 'lodash';

import {
    bootstrap,
    bootstrapError,
    changeProject,
    projectSelectRequested,
    ensureDatasetsAreLoaded,
    historyStatePopped,
    resetApplication,
    appFinishedLoading
} from '../app_context_actions';

import initialState from '../../reducers/initial_state';
import * as StatePaths from '../../constants/StatePaths';
import * as Errors from '../../constants/Errors';
import * as Actions from '../../constants/Actions';

import { createTestLogging } from '../../utils/test_logging';
import { createActionStore } from '../../utils/test_action_store';
import { createLoggerService } from '../../utils/test_logger_service';

function getBootstrapData() {
    return {
        bootstrapResource: {
            current: {
                featureFlags: {
                    enableCsvUploader: false,
                    analyticalDesigner: true
                },
                project: {
                    meta: {
                        title: 'Project Foo'
                    }
                },
                projectPermissions: {
                    permissions: {
                        canAccessWorkbench: '1',
                        canCreateReport: '1',
                        canUploadNonProductionCSV: '1'
                    }
                }
            },
            profileSetting: {
                currentProjectUri: '/gdc/projects/myProjectId'
            }
        }
    };
}

function getWindow() {
    let mockWindow = $('<div style="width: 200px; height:300px;"/>');
    mockWindow.devicePixelRatio = 2.0;
    mockWindow.location = {
        href: '/analyze/#/myProjectId/reportId/edit',
        hash: '#/myProjectId/reportId/edit',
        pathname: '',
        reload: sinon.spy()
    };
    return mockWindow;
}

function enableCsvUploader(state) {
    return state.setIn([...StatePaths.FEATURE_FLAGS, 'enableCsvUploader'], true)
        .setIn([...StatePaths.BOOTSTRAP_DATA_PERMISSIONS, StatePaths.Permissions.CAN_UPLOAD_NON_PRODUCTION_CSV], true);
}

describe('App Context Actions', () => {
    describe('bootstrap', () => {
        let actionStore, getState, dispatch, findActionByType, bootstrapData, windowInstance;

        beforeEach(() => {
            actionStore = createActionStore();

            getState = sinon.stub().returns(initialState);
            dispatch = sinon.spy(actionStore.dispatch);

            findActionByType = actionStore.findActionByType;

            bootstrapData = getBootstrapData();
            windowInstance = getWindow();
        });

        function createDependencies(customDeps = {}) {
            const LoggerService = createLoggerService();
            const { log, formatter } = createTestLogging();
            const defaultDeps = {
                log,
                formatter,
                loggerService: LoggerService,
                loadBootstrap: sinon.stub().returns(Promise.resolve(bootstrapData)),
                updateProfileSettings: sinon.spy(),
                ensureDatasetsAreLoadedCreator: sinon.stub().returns(Promise.resolve()),
                appFinishedLoadingCreator: appFinishedLoading
            };
            return {
                ...defaultDeps,
                ...customDeps
            };
        }

        it('should GA log accessing AD', () => {
            const dependencies = createDependencies();

            const action = bootstrap(windowInstance, 'project-id-123', null, dependencies);
            return action(dispatch, getState).then(() => {
                expect(dependencies.loggerService.logAccessingAD).to.be.calledOnce();
            });
        });

        describe('success load', () => {
            it('should update profile settings', () => {
                const dependencies = createDependencies();

                const action = bootstrap(windowInstance, 'project-id-123', null, dependencies);
                return action(dispatch, getState).then(() => {
                    expect(dependencies.updateProfileSettings).to.be.calledWith(
                        'project-id-123',
                        get(bootstrapData, 'bootstrapResource.profileSetting')
                    );
                });
            });

            it('should log action', () => {
                const { log, formatter, findLogEntryByMessage } = createTestLogging();
                const dependencies = createDependencies({ log, formatter });

                const action = bootstrap(windowInstance, 'project-id-123', null, dependencies);
                return action(dispatch, getState).then(() => {
                    expect(
                        findLogEntryByMessage(Actions.APP_READINESS_CHANGE)
                    ).to.be.ok();
                });
            });
        });

        describe('setting current dataset', () => {
            let dependencies;

            beforeEach(() => {
                dependencies = createDependencies();
            });

            it('should not set current dataset by default', () => {
                return dispatch(bootstrap(windowInstance, 'project-id-123', null, dependencies))
                    .then(() => {
                        expect(dependencies.loadBootstrap).to.be.calledWith('project-id-123');

                        const setActiveDatasetAction = findActionByType(Actions.CATALOGUE_SET_ACTIVE_DATASET_ID);
                        expect(setActiveDatasetAction.payload).to.eql({ datasetId: null, preselect: true });
                    });
            });

            it('should be possible to set current dataset if csv uploader is enabled', () => {
                actionStore.setState(enableCsvUploader(initialState));

                const CSV_DATASET_ID = 'dataset.payroll';

                return dispatch(bootstrap(windowInstance, 'project-id-123', CSV_DATASET_ID, dependencies))
                    .then(() => {
                        expect(dependencies.loadBootstrap).to.be.calledWith('project-id-123');

                        const setActiveDatasetAction = findActionByType(Actions.CATALOGUE_SET_ACTIVE_DATASET_ID);
                        expect(setActiveDatasetAction.payload).to.eql({ datasetId: CSV_DATASET_ID, preselect: true });
                    });
            });
        });

        describe('url check', () => {
            let dependencies;

            beforeEach(() => {
                dependencies = createDependencies();

                windowInstance.location.pathname = '';
                windowInstance.location.hash = '';
            });

            it('should execute redirect if there is no projectId in url', () => {
                const action = bootstrap(windowInstance, 'myProjectId', null, dependencies);
                return action(dispatch, getState).then(() => {
                    expect(dependencies.loadBootstrap).to.be.calledOnce();
                    expect(windowInstance.location.href).to.eql('#/myProjectId/reportId/edit');
                    expect(windowInstance.location.reload).to.be.calledOnce();
                });
            });

            it('should dispatch error if there is no projectId in url & no project in stash', () => {
                delete bootstrapData.bootstrapResource.profileSetting;

                const action = bootstrap(windowInstance, 'myProjectId', null, dependencies);
                const expectedError = bootstrapError({
                    error: { type: Errors.NO_PROJECT_AVAILABLE_ERROR },
                    projectId: 'myProjectId',
                    location: windowInstance.location
                });

                return action(dispatch, getState).then(() => {
                    expect(dispatch).to.be.calledWith(expectedError);
                });
            });
        });

        describe('checking', () => {
            let dependencies, action;

            beforeEach(() => {
                dependencies = createDependencies();
                action = bootstrap(windowInstance, 'project-id-123', null, dependencies);
            });

            const getError = type => bootstrapError({
                error: { type },
                projectId: 'project-id-123',
                location: windowInstance.location
            });

            const expectError = type =>
                 dispatch(action).then(() => {
                     const errorAction = findActionByType(Actions.BOOTSTRAP_ERROR);
                     expect(errorAction).to.eql(getError(type));
                 });

            it('should dispatch error if user has analyticalDesigner flag disabled', () => {
                bootstrapData.bootstrapResource.current.featureFlags.analyticalDesigner = null;

                return expectError(Errors.ACCESS_DESIGNER_DENIED_ERROR);
            });

            it('should dispatch error if user cannot access workbench', () => {
                bootstrapData.bootstrapResource.current
                    .projectPermissions.permissions.canAccessWorkbench = '0';

                return expectError(Errors.ACCESS_WORKBENCH_DENIED_ERROR);
            });

            it('should dispatch error if permissions are not available', () => {
                bootstrapData.bootstrapResource.current
                    .projectPermissions = {};

                return expectError(Errors.NOT_AUTHORIZED_ERROR);
            });

            it('should dispatch error if user cannot create report', () => {
                bootstrapData.bootstrapResource.current
                    .projectPermissions.permissions.canCreateReport = '0';

                return expectError(Errors.CREATE_REPORT_DENIED_ERROR);
            });

            it('should dispatch error if invalid project id is specified', () => {
                bootstrapData.bootstrapResource.current.project = null;

                return expectError(Errors.PROJECT_NOT_FOUND_ERROR);
            });
        });
    });

    describe('ensureDatasetsAreLoaded', () => {
        let dispatch;

        beforeEach(() => {
            dispatch = sinon.spy(identity);
        });

        it('should load datasets when feature flag is set', () => {
            let getState = sinon.stub().returns(enableCsvUploader(initialState));
            let datasetsRequested = sinon.stub().returns(Promise.resolve());
            let thunk = ensureDatasetsAreLoaded('myproject', datasetsRequested);

            return thunk(dispatch, getState).then(() => {
                expect(datasetsRequested).to.be.calledWith('myproject');
                expect(dispatch).to.be.calledOnce();
            });
        });

        it('should not load datasets when feature flag is turned off', () => {
            let getState = sinon.stub().returns(initialState);
            let datasetsRequested = sinon.stub();
            let thunk = ensureDatasetsAreLoaded('myproject', datasetsRequested);

            return thunk(dispatch, getState).then(() => {
                expect(datasetsRequested).not.to.be.called();
                expect(dispatch).not.to.be.called();
            });
        });
    });

    describe('changeProject', () => {
        it('should reset state to initial and run bootstrap', () => {
            const projectId = 'if4uo5h50uvdllzyeqle3yyi45sna5d0';
            const datasetId = 'dataset.payroll';

            let dispatchStub = sinon.stub(),
                changeProjectStub = sinon.stub(),
                bootstrapStub = sinon.stub(),
                mockWindow = {};

            const dependencies = {
                changeProjectCreator: changeProjectStub,
                bootstrapCreator: bootstrapStub
            };

            changeProject(mockWindow, projectId, datasetId, dependencies)(dispatchStub);
            expect(changeProjectStub).to.be.calledOnce();
            expect(bootstrapStub).to.be.calledWith(mockWindow, projectId, datasetId);
            expect(dispatchStub).to.be.calledTwice();
        });
    });

    describe('projectSelectRequested', () => {
        const projectId = 'if4uo5h50uvdllzyeqle3yyi45sna5d0';
        let mockWindow, dispatchStub;

        beforeEach(() => {
            mockWindow = {};
            set(mockWindow, 'history.pushState', sinon.stub());
            set(mockWindow, 'location.pathname', '/analyze/');

            dispatchStub = sinon.stub();
        });

        it('should push new history state', () => {
            projectSelectRequested(mockWindow, projectId, () => {})(dispatchStub);
            let expectedUrl = '/analyze/#/if4uo5h50uvdllzyeqle3yyi45sna5d0/reportId/edit';
            expect(mockWindow.history.pushState).to.be.calledWith(null, null, expectedUrl);
        });

        it('should dispatch changeProject', () => {
            let changeProjectStub = sinon.stub();
            projectSelectRequested(mockWindow, projectId, changeProjectStub)(dispatchStub);
            expect(changeProjectStub).to.be.calledWith(mockWindow, projectId);
            expect(dispatchStub).to.be.calledOnce();
        });
    });

    describe('historyStatePopped', () => {
        let getState, state, windowInstance,
            changeProjectStub, reloadCatalogueWithDatasetStub, dispatchStub;

        beforeEach(() => {
            state = initialState.setIn(StatePaths.PROJECT_ID, 'goodsales');
            getState = sinon.stub().returns(state);

            windowInstance = {};

            changeProjectStub = sinon.stub();
            reloadCatalogueWithDatasetStub = sinon.stub();
            dispatchStub = sinon.stub();
        });

        it('should reload catalogue with proper dataset when dataset changes', () => {
            let routeParams = { projectId: 'goodsales', datasetId: 'dataset.payroll' };

            let thunk = historyStatePopped(windowInstance, routeParams, changeProjectStub, reloadCatalogueWithDatasetStub);
            thunk(dispatchStub, getState);

            expect(dispatchStub).to.be.calledOnce();
            expect(reloadCatalogueWithDatasetStub).to.be.calledWith({ datasetId: 'dataset.payroll' });
        });

        it('should switch project when project uri changes', () => {
            let routeParams = { projectId: 'supersoda', datasetId: 'dataset.payroll' };

            let thunk = historyStatePopped(windowInstance, routeParams, changeProjectStub, reloadCatalogueWithDatasetStub);
            thunk(dispatchStub, getState);

            expect(dispatchStub).to.be.calledOnce();
            expect(changeProjectStub).to.be.calledWith(windowInstance, 'supersoda', 'dataset.payroll');
        });
    });

    describe('resetApplication', () => {
        it('should reset application, reload catalogue and call GA', () => {
            const LoggerService = createLoggerService();
            const dispatchStub = sinon.stub();
            const resetApplicationStub = sinon.stub();

            const dependencies = {
                log: noop,
                loggerService: LoggerService,
                formatter: noop,
                resetApplicationCreator: resetApplicationStub
            };
            const thunk = resetApplication(dependencies);
            thunk(dispatchStub, () => initialState);

            expect(dispatchStub).to.be.calledOnce();
            expect(resetApplicationStub).to.be.calledOnce();
            expect(LoggerService.logADClear).to.be.calledOnce();
        });
    });
});

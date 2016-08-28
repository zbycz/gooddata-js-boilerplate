import $ from 'jquery';
import { get, isEmpty, partial } from 'lodash';
import Promise from 'bluebird';

import { isMobile } from '../utils/BrowserDetect';
import { datasetsRequested, setActiveCatalogueDataset } from './data_actions';
import * as Actions from '../constants/Actions';
import * as Errors from '../constants/Errors';
import * as API from '../utils/api';
import { isCsvUploaderEnabled, getProjectId } from '../selectors/bootstrap_selector';

import { logger } from './log_decorator';
import * as LoggerService from '../services/logger_service';
import { bootstrapFormatter, resetFormatter } from './log_formatters';

import buildMessage from '../utils/message_builder';
import { getProjectIdFromUri, getProjectUri } from '../utils/location';

const PROJECT_PREFIX = '/gdc/projects/';

const bootstrapData = buildMessage(Actions.BOOTSTRAP_DATA);

const logDependencies = {
    log: LoggerService.log,
    loggerService: LoggerService
};

function bootstrapDataReceived(windowInstance, data) {
    const $window = $(windowInstance);
    const viewportWidth = $window.width();
    const viewportHeight = $window.height();

    const windowInfo = {
        viewport: `${viewportWidth}x${viewportHeight}`,
        pixelRatio: windowInstance.devicePixelRatio || 1,
        isMobileDevice: isMobile(windowInstance)
    };

    return bootstrapData({ data, windowInfo });
}

export const bootstrapError = buildMessage(Actions.BOOTSTRAP_ERROR);

export const loggedOut = buildMessage(Actions.LOGOUT_DATA);

export const appReadinessChange = buildMessage(Actions.APP_READINESS_CHANGE);

export function appStartedLoading() {
    return appReadinessChange({ isReady: false });
}

export function appFinishedLoading() {
    return appReadinessChange({ isReady: true });
}

export function ensureDatasetsAreLoaded(projectId, datasetsRequestedCreator = datasetsRequested) {
    return (dispatch, getState) => {
        const state = getState();

        if (isCsvUploaderEnabled(state)) {
            return dispatch(datasetsRequestedCreator(projectId));
        }

        return Promise.resolve();
    };
}

function checkPermissions(data) {
    const { current } = get(data, 'bootstrapResource');

    const analyticalDesignerFeatureFlag = get(current, 'featureFlags.analyticalDesigner');
    if (!analyticalDesignerFeatureFlag) {
        return Promise.reject({ type: Errors.ACCESS_DESIGNER_DENIED_ERROR });
    }

    const permissions = get(current, 'projectPermissions.permissions');

    if (isEmpty(permissions)) {
        return Promise.reject({ type: Errors.NOT_AUTHORIZED_ERROR });
    }

    const { canAccessWorkbench, canCreateReport } = permissions;

    if (canAccessWorkbench === '0') {
        return Promise.reject({ type: Errors.ACCESS_WORKBENCH_DENIED_ERROR });
    }

    if (canCreateReport === '0') {
        return Promise.reject({ type: Errors.CREATE_REPORT_DENIED_ERROR });
    }

    return data;
}

function checkProject(projectId, data) {
    let currentProject = get(data, 'bootstrapResource.current.project');

    if (!currentProject) {
        return Promise.reject({ type: Errors.PROJECT_NOT_FOUND_ERROR });
    }

    return data;
}

function checkUri(windowInstance, data) {
    if (!getProjectIdFromUri(windowInstance.location.hash)) {
        const currentProjectUri = get(data, 'bootstrapResource.profileSetting.currentProjectUri');

        if (!currentProjectUri) {
            return Promise.reject({ type: Errors.NO_PROJECT_AVAILABLE_ERROR });
        }

        const currentProjectId = currentProjectUri.replace(PROJECT_PREFIX, '');
        windowInstance.location.href = getProjectUri(windowInstance, currentProjectId);
        windowInstance.location.reload();
    }

    return data;
}

const boostrapDependecies = {
    ...logDependencies,
    formatter: bootstrapFormatter,
    appFinishedLoadingCreator: appFinishedLoading,
    loadBootstrap: API.bootstrap,
    updateProfileSettings: API.updateProfileSettings,
    ensureDatasetsAreLoadedCreator: ensureDatasetsAreLoaded
};

export function bootstrap(windowInstance, projectId, datasetId, dependencies = boostrapDependecies) {
    return (dispatch, getState) => {
        const { loadBootstrap, updateProfileSettings, loggerService, ensureDatasetsAreLoadedCreator, appFinishedLoadingCreator } = dependencies;
        dispatch(appStartedLoading());
        loggerService.logAccessingAD({ state: getState() });

        return loadBootstrap(projectId)
            .then(checkPermissions)
            .then(partial(checkUri, windowInstance))
            .then(partial(checkProject, projectId))
            .then(data => {
                const profileSetting = get(data, 'bootstrapResource.profileSetting');
                // we don't care about the result intentionally
                updateProfileSettings(projectId, profileSetting);

                dispatch(bootstrapDataReceived(windowInstance, data));
                dispatch(setActiveCatalogueDataset({ datasetId, preselect: true }));

                return dispatch(ensureDatasetsAreLoadedCreator(projectId));
            })
            .then(() => dispatch(logger(dependencies, appFinishedLoadingCreator)()))
            .catch(error => dispatch(bootstrapError({
                error,
                projectId,
                location: windowInstance.location
            })));
    };
}

export function logoutRequested(windowInstance) {
    return dispatch => {
        dispatch({ type: Actions.LOGOUT });

        API.logout().finally(() => dispatch(loggedOut({ location: windowInstance.location })));
    };
}

function resetApplicationPure() {
    return {
        type: Actions.RESET_APPLICATION
    };
}

const resetDependencies = {
    ...logDependencies,
    formatter: resetFormatter,
    resetApplicationCreator: resetApplicationPure
};

export function resetApplication(dependencies = resetDependencies) {
    return logger(dependencies, () => (dispatch, getState) => {
        const { loggerService, resetApplicationCreator } = dependencies;
        dispatch(resetApplicationCreator());

        loggerService.logADClear({ state: getState() });
    })();
}

function changeProjectPure() {
    return {
        type: Actions.CHANGE_PROJECT
    };
}

const changeProjectDependencies = {
    bootstrapCreator: bootstrap,
    changeProjectCreator: changeProjectPure
};

export function changeProject(windowInstance, projectId, datasetId = null, dependencies = changeProjectDependencies) {
    return dispatch => {
        const { bootstrapCreator, changeProjectCreator } = dependencies;
        dispatch(changeProjectCreator());
        dispatch(bootstrapCreator(windowInstance, projectId, datasetId));
    };
}

export function historyStatePopped(windowInstance, routeParams, changeProjectCreator = changeProject, reloadCatalogueWithDatasetCreator = setActiveCatalogueDataset) {
    return (dispatch, getState) => {
        let currentProjectId = getProjectId(getState());

        if (currentProjectId !== routeParams.projectId) {
            dispatch(changeProjectCreator(windowInstance, routeParams.projectId, routeParams.datasetId));
        } else {
            dispatch(reloadCatalogueWithDatasetCreator({ datasetId: routeParams.datasetId }));
        }
    };
}

export function projectSelectRequested(windowInstance, projectId, changeProjectCreator = changeProject) {
    return dispatch => {
        dispatch(changeProjectCreator(windowInstance, projectId));

        const uri = getProjectUri(windowInstance, projectId);
        windowInstance.history.pushState(null, null, uri);
    };
}

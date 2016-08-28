import { createSelector } from 'reselect';

import * as StatePaths from '../constants/StatePaths';

export function getUserUri(state) {
    return state.getIn(StatePaths.USER_URI);
}

export function getProjectId(state) {
    return state.getIn(StatePaths.PROJECT_ID);
}

export function getUserLoginMD5(state) {
    return state.getIn(StatePaths.USER_LOGIN_MD5);
}

export function getUserEmailDomain(state) {
    return state.getIn(StatePaths.USER_EMAIL, '').split('@').pop();
}

export function getOrganizationName(state) {
    return state.getIn(StatePaths.ORGANIZATION_NAME);
}

export function getViewport(state) {
    return state.getIn(StatePaths.DEVICE_VIEWPORT);
}

export function getDevicePixelRatio(state) {
    return state.getIn(StatePaths.DEVICE_PIXEL_RATIO);
}

export function getViewportInfo(state) {
    const viewport = getViewport(state);
    const devicePixelRatio = getDevicePixelRatio(state);

    return `(${viewport})*${devicePixelRatio}`;
}

export function getProjectTemplate(state) {
    return state.getIn(StatePaths.PROJECT_TEMPLATE);
}

export function getIsMobileDevice(state) {
    return state.getIn(StatePaths.IS_MOBILE_DEVICE);
}

export function getIsEmbedded(state) {
    return state.getIn(StatePaths.IS_EMBEDDED);
}

export function getProjectTimezoneOffset(state) {
    return state.getIn(StatePaths.PROJECT_TIMEZONE_OFFSET);
}

export const isCsvUploaderEnabled = createSelector(
    state => state.getIn([...StatePaths.FEATURE_FLAGS, 'enableCsvUploader']),
    state => state.getIn([...StatePaths.BOOTSTRAP_DATA_PERMISSIONS, StatePaths.Permissions.CAN_UPLOAD_NON_PRODUCTION_CSV]),
    getIsEmbedded,

    (enableCsvUploader, canUploadNonProductionCsv, isEmbedded) =>
        enableCsvUploader && canUploadNonProductionCsv && !isEmbedded
);

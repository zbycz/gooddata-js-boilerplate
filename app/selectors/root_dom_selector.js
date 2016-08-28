import { createSelector } from 'reselect';
import * as StatePaths from '../constants/StatePaths';
import { isReportOpeningSelector } from './open_report_selector';
import { getIsEmbedded } from './bootstrap_selector';

function getUserFullName(state) {
    const firstName = state.getIn(StatePaths.USER_FIRST_NAME);
    const lastName = state.getIn(StatePaths.USER_LAST_NAME);

    return `${firstName} ${lastName}`;
}

function getProjectTitle(state) {
    return state.getIn(StatePaths.PROJECT_TITLE);
}

function getProjectUri(state) {
    return state.getIn(StatePaths.PROJECT_URI);
}

function getProject(state) {
    return {
        title: getProjectTitle(state),
        uri: getProjectUri(state)
    };
}

export default createSelector(
    state => state.getIn(StatePaths.BRANDING),
    state => state.getIn(StatePaths.USER_URI),
    getProject,
    state => state.getIn(StatePaths.MENU_ITEMS),
    state => state.getIn(StatePaths.ACCOUNT_MENU_ITEMS),
    getUserFullName,
    isReportOpeningSelector,
    getIsEmbedded,

    (branding, profileUri, project, menuItems, accountMenuItems, userName, isReportOpening, isEmbedded) => ({
        branding,
        profileUri,
        project,
        menuItems,
        accountMenuItems,
        userName,
        isReportOpening,
        isEmbedded
    })
);

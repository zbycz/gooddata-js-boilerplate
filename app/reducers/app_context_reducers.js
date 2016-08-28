import { Record, Map, List, fromJS } from 'immutable';
import { get, keys, partial } from 'lodash';

import * as Header from 'goodstrap/packages/Header/ReactHeader';

import * as Actions from '../constants/Actions';
import * as StatePaths from '../constants/StatePaths';
import * as MenuConstants from '../constants/Menu';
import * as Errors from '../constants/Errors';

import { isLoggedInViaSso } from '../utils/sso';

import initialState from './initial_state';
import { getIsEmbedded } from '../selectors/bootstrap_selector';


const BootstrapDataRecord = new Record({
    project: {},
    permissions: {},
    profileSetting: {},
    accountSetting: {},
    branding: {},
    featureFlags: {},
    isBootstrapLoaded: false
});

const TRANSLATIONS = {
    kpis: 'header.kpis',
    dashboards: 'header.dashboards',
    analyze: 'header.analyze',
    reports: 'header.reports',
    manage: 'header.manage',
    load: 'header.load',
    account: 'header.account',
    dic: 'header.dic',
    logout: 'header.logout'
};

const ActiveMenuItems = 'analyze';

function transformBootstrapData(bootstrapData) {
    function transformProject(current) {
        const project = current.project;
        const projectTemplate = get(current, ['projectTemplates', 0, 'url']);
        const uri = project.links.self;
        const timezoneOffset = get(current, 'timezone.currentOffsetMs');

        return new Map({
            id: uri.split('/').pop(),
            uri,
            title: project.meta.title,
            template: projectTemplate,
            timezoneOffset
        });
    }

    function transformProfileSetting() {
        return fromJS({
            ...bootstrapData.bootstrapResource.profileSetting
        });
    }

    function transformPermissions(bootstrapPermissions) {
        return new Map(keys(bootstrapPermissions).reduce((permissions, permission) => {
            permissions[permission] = bootstrapPermissions[permission] === '1';
            return permissions;
        }, {}));
    }

    function transformAccountSetting() {
        return fromJS({
            ...bootstrapData.bootstrapResource.accountSetting,
            loginMD5: bootstrapData.bootstrapResource.current.loginMD5
        });
    }

    const bootstrapPermissions = get(
        bootstrapData,
        ['bootstrapResource', 'current', 'projectPermissions', 'permissions'],
        {});

    return new BootstrapDataRecord({
        project: transformProject(bootstrapData.bootstrapResource.current),
        permissions: transformPermissions(bootstrapPermissions),
        accountSetting: transformAccountSetting(),
        profileSetting: transformProfileSetting(),
        branding: fromJS(bootstrapData.bootstrapResource.settings),
        featureFlags: fromJS(bootstrapData.bootstrapResource.current.featureFlags)
    });
}

function hackMenuForTranslations(menu) {
    return menu.map(menuItem => {
        menuItem[MenuConstants.ITEM_TRANSLATION_KEY] = menuItem.title;
        delete menuItem.title;
        return menuItem;
    });
}

function bootstrap(state, action) {
    const { data, windowInfo } = action.payload;

    const headerMenu = hackMenuForTranslations(Header.generateHeaderMenu(data, {
        translations: TRANSLATIONS,
        activeItem: ActiveMenuItems
    }));

    const headerAccountMenu = hackMenuForTranslations(
        Header.generateAccountMenu(data, { translations: TRANSLATIONS })
    );

    const bootstrapData = transformBootstrapData(data);
    const pageTitle = initialState.getIn(StatePaths.PAGE_TITLE);
    const brandTitle = bootstrapData.getIn(['branding', 'applicationTitle']);

    return state
        .setIn(StatePaths.BOOTSTRAP, bootstrapData)
        .setIn(StatePaths.PAGE_TITLE, `${pageTitle} - ${brandTitle}`)
        .setIn(StatePaths.MENU_ITEMS, new List(headerMenu))
        .setIn(StatePaths.ACCOUNT_MENU_ITEMS, new List(headerAccountMenu))
        .setIn(StatePaths.DEVICE_VIEWPORT, windowInfo.viewport)
        .setIn(StatePaths.DEVICE_PIXEL_RATIO, windowInfo.pixelRatio)
        .setIn(StatePaths.IS_MOBILE_DEVICE, windowInfo.isMobileDevice);
}

const getAccountPageUri = ({ location }) => `/account.html?lastUrl=${encodeURIComponent(location.href)}`;

const getProjectPageUri = status => `/projects.html#status=${status}`;

const getDashboardUri = ({ projectId }) => `/#s=/gdc/projects/${projectId}|projectDashboardPage`;

const getInfoUri = status => `/account.html#/info/${status}`;
const getEmbeddedUnauthorizedUri = partial(getInfoUri, 'ssoUnauthorized');

const redirectTo = (getUri, state, { projectId, location }) => {
    location.href = getUri({ projectId, location });
    return state;
};

const storeError = (state, { error, projectId }) => {
    return state
        .setIn(StatePaths.PROJECT_ID, projectId)
        .updateIn(StatePaths.ERRORS, errors => errors.push(error));
};

const errorHandlers = {
    mainSso: {
        [Errors.NOT_AUTHENTICATED_ERROR]: partial(redirectTo, getEmbeddedUnauthorizedUri),
        [Errors.NOT_AUTHORIZED_ERROR]: partial(redirectTo, getEmbeddedUnauthorizedUri),
        [Errors.ACCESS_WORKBENCH_DENIED_ERROR]: partial(redirectTo, getEmbeddedUnauthorizedUri),
        [Errors.ACCESS_DESIGNER_DENIED_ERROR]: partial(redirectTo, getDashboardUri),
        [Errors.CREATE_REPORT_DENIED_ERROR]: partial(redirectTo, getDashboardUri)
    },
    main: {
        [Errors.NOT_AUTHENTICATED_ERROR]: partial(redirectTo, getAccountPageUri),
        [Errors.NOT_AUTHORIZED_ERROR]: partial(redirectTo, partial(getProjectPageUri, 'notAuthorized')),
        [Errors.ACCESS_WORKBENCH_DENIED_ERROR]: partial(redirectTo, partial(getProjectPageUri, 'cannotAccessWorkbench')),
        [Errors.ACCESS_DESIGNER_DENIED_ERROR]: partial(redirectTo, getDashboardUri),
        [Errors.CREATE_REPORT_DENIED_ERROR]: partial(redirectTo, getDashboardUri)
    },
    embeddedSso: {
        [Errors.NOT_AUTHENTICATED_ERROR]: partial(redirectTo, getEmbeddedUnauthorizedUri),
        [Errors.NOT_AUTHORIZED_ERROR]: partial(redirectTo, getEmbeddedUnauthorizedUri),
        [Errors.ACCESS_WORKBENCH_DENIED_ERROR]: partial(redirectTo, getEmbeddedUnauthorizedUri)
    },
    embedded: {
        [Errors.NOT_AUTHENTICATED_ERROR]: partial(redirectTo, getAccountPageUri)
    }
};

function bootstrapError(state, { payload }, loggedInViaSso = isLoggedInViaSso) {
    const key = `${getIsEmbedded(state) ? 'embedded' : 'main'}${loggedInViaSso() ? 'Sso' : ''}`;
    const errorHandler = errorHandlers[key][payload.error.type] || storeError;

    return errorHandler(state, payload);
}

function loggedOut(state, { payload }, loggedInViaSso = isLoggedInViaSso) {
    const { location } = payload;

    location.href = (loggedInViaSso() ? getInfoUri('logout') : '/');

    return state;
}

export function changeAppReadiness(state, action) {
    const newState = state.setIn(StatePaths.APP_READY, action.payload.isReady);
    return newState;
}

export function resetApplication(state) {
    return state.withMutations(mutableState => (
        mutableState
            .setIn(StatePaths.REPORT_EXECUTION_FIRST, true)
            .setIn(StatePaths.REPORT_NOW_OPEN, false)
            .setIn(StatePaths.RESET_POSSIBLE, false)
            .setIn(StatePaths.ATTRIBUTE_ELEMENTS, initialState.getIn(StatePaths.ATTRIBUTE_ELEMENTS))
            .setIn(StatePaths.AVAILABLE_ATTRIBUTES, initialState.getIn(StatePaths.AVAILABLE_ATTRIBUTES))
            .setIn(StatePaths.DND_DATA, initialState.getIn(StatePaths.DND_DATA))
            .setIn(StatePaths.VISUALIZATION_TYPE, initialState.getIn(StatePaths.VISUALIZATION_TYPE))
            .setIn(StatePaths.BUCKETS, initialState.getIn(StatePaths.BUCKETS))
            .setIn(StatePaths.DATE_DATASETS_SELECTED, null)
            .setIn(StatePaths.REPORT_CURRENT_TITLE, initialState.getIn(StatePaths.REPORT_CURRENT_TITLE))
            .setIn(StatePaths.REPORT_LAST_SAVED_OBJECT, initialState.getIn(StatePaths.REPORT_LAST_SAVED_OBJECT))
            .setIn(StatePaths.REPORT_EXECUTION, initialState.getIn(StatePaths.REPORT_EXECUTION))
    ));
}

export function changeProject(state) {
    return resetApplication(state)
        .setIn(StatePaths.DATE_DATASETS,
            initialState.getIn(StatePaths.DATE_DATASETS))
        .setIn(StatePaths.UNDO_POSSIBLE, false)
        .setIn(StatePaths.REDO_POSSIBLE, false);
}

export default (state, action, loggedInViaSso = isLoggedInViaSso) => {
    switch (action.type) {
        case Actions.APP_READINESS_CHANGE:
            return changeAppReadiness(state, action);
        case Actions.RESET_APPLICATION:
            return resetApplication(state, action);
        case Actions.CHANGE_PROJECT:
            return changeProject(state);
        case Actions.BOOTSTRAP_DATA:
            return bootstrap(state, action);
        case Actions.BOOTSTRAP_ERROR:
            return bootstrapError(state, action, loggedInViaSso);
        case Actions.LOGOUT_DATA:
            return loggedOut(state, action, loggedInViaSso);
        default:
            return state;
    }
};

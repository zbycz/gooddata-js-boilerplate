import { isUndefined, keys, isNil, omitBy, snakeCase, pick, partial } from 'lodash';
import sdk from 'gooddata';
import Promise from 'bluebird';
import invariant from 'invariant';

import * as BootstrapSelector from '../selectors/bootstrap_selector';

const serializeMessage = (message, params) => (
    keys(omitBy(params, isNil)).reduce((result, key) => {
        const value = params[key];
        const logKey = snakeCase(key);

        return `${result} ${logKey}=${value}`;
    }, message)
);

const getLogUri = pid => `/gdc/app/projects/${pid}/log`;

const logDebug = messages => {
    messages.forEach(message => console.debug('log:', message)); // eslint-disable-line no-console
    return Promise.resolve();
};

const logProduction = (uri, messages) =>
    Promise.resolve(sdk.xhr.ajax(uri, {
        type: 'POST',
        data: { logMessages: messages }
    }));

const log = (projectId, message, params) => {
    const messages = [serializeMessage(message, params)];

    if (DEBUG && !TESTING) {
        return logDebug(messages);
    }

    if (!TESTING) {
        const logUri = getLogUri(projectId);
        return logProduction(logUri, messages);
    }

    return null;
};

export { log };

const getCustomDimensions = state => ({
    // dimension1: 'Logged-in' / 'Guest' is used in old client only
    dimension2: BootstrapSelector.getUserLoginMD5(state),
    dimension3: BootstrapSelector.getUserEmailDomain(state),
    dimension4: BootstrapSelector.getOrganizationName(state),
    dimension5: BootstrapSelector.getProjectId(state),
    // dimension6: origin used in interactive reports
    // dimension7: 'dashboard id' is used in new dashboards
    dimension8: BootstrapSelector.getViewportInfo(state),
    dimension9: BootstrapSelector.getProjectTemplate(state)
});

const enrichWithCustomDimensions = (state, fieldsObject) => omitBy({
    ...getCustomDimensions(state),
    ...fieldsObject
}, isUndefined);

const logToGA = (...args) => {
    if (TESTING) return;

    if (DEBUG) {
        console.debug('log:ga', ...args); // eslint-disable-line no-console
    }

    window.ga(...args);
};

const send = fieldsObject => logToGA('send', fieldsObject);

export const sendLogEvent = (state, { action, label, value, ...rest }, logFn = send) =>
    logFn(enrichWithCustomDimensions(state, {
        hitType: 'event',
        eventCategory: 'analyticalDesigner',
        eventAction: action,
        eventLabel: label,
        eventValue: value, // integer
        ...rest
    }));

export const sendLogPageView = (state, options = { page: '' }, logFn = send) => {
    const isEmbedded = BootstrapSelector.getIsEmbedded(state);

    logFn(enrichWithCustomDimensions(state, {
        hitType: 'pageview',
        title: 'analytical designer',
        page: `${(isEmbedded ? '/insights-embed' : '/insights')}${options.page}/`,
        location: options.location // [optional]
    }));
};

export const sendLogTiming = (state, { label, value, variable }, logFn = send) =>
    logFn(omitBy({
        hitType: 'timing',
        timingCategory: 'analyticalDesigner',
        timingVar: variable,
        timingValue: value,
        timingLabel: label
    }, isUndefined));

const logConfigs = {
    access: {
        page: '',
        timing: false,
        event: false
    },
    open: {
        page: '/open',
        action: 'visualization open',
        label: 'success'
    },
    clear: {
        page: '',
        timing: false,
        action: 'analytical designer clear',
        label: 'success'
    },
    openAsReport: {
        action: 'visualization open as report',
        label: 'success'
    },
    savedAsNew: {
        action: 'visualization save as new',
        label: 'success'
    },
    updated: {
        action: 'visualization update',
        label: 'success'
    },
    firstSave: {
        action: 'visualization save',
        label: 'success'
    },
    saveAsNewFailed: {
        action: 'visualization save as new',
        label: 'failed'
    },
    updateFailed: {
        action: 'visualization update',
        label: 'failed'
    },
    firstSaveFailed: {
        action: 'visualization save',
        label: 'failed'
    },
    firstExecution: {
        page: '/ad-hoc',
        timing: false,
        event: false
    },
    executed: {
        action: 'visualization execute',
        label: 'success'
    },
    executionFailed: {
        action: 'visualization execute',
        label: 'failed'
    },
    deleted: {
        action: 'visualization delete',
        label: 'success'
    },
    deleteFailed: {
        action: 'visualization delete',
        label: 'failed'
    }
};

function logGA(eventName, { state, time }) {
    const logConfig = logConfigs[eventName];

    invariant(logConfig, `Log config for GA log event '${eventName}' was not found.`);

    if (typeof logConfig.page !== 'undefined') {
        sendLogPageView(state, { page: logConfig.page });
    }

    if (logConfig.timing !== false) {
        sendLogTiming(state, { variable: logConfig.action, label: logConfig.label, value: time });
    }

    if (logConfig.event !== false) {
        sendLogEvent(state, pick(logConfig, 'action', 'label'));
    }
}

export const logAccessingAD = partial(logGA, 'access');
export const logVisualizationOpen = partial(logGA, 'open');
export const logADClear = partial(logGA, 'clear');
export const logOpenAsReport = partial(logGA, 'openAsReport');
export const logVisualizationSavedAsNew = partial(logGA, 'savedAsNew');
export const logVisualizationUpdated = partial(logGA, 'updated');
export const logVisualizationFirstSave = partial(logGA, 'firstSave');

export const logVisualizationSaved = ({ state, time, saveAsNew, isUpdate }) => {
    if (saveAsNew) {
        logGA('savedAsNew', { state, time });
    } else {
        logGA(isUpdate ? 'updated' : 'firstSave', { state, time });
    }
};

export const logVisualizationSaveAsNewFailed = partial(logGA, 'saveAsNewFailed');
export const logVisualizationUpdateFailed = partial(logGA, 'updateFailed');
export const logVisualizationFirstSaveFailed = partial(logGA, 'firstSaveFailed');

export const logVisualizationSaveFailed = ({ state, time, saveAsNew, isUpdate }) => {
    if (saveAsNew) {
        logGA('saveAsNewFailed', { state, time });
    } else {
        logGA(isUpdate ? 'updateFailed' : 'firstSaveFailed', { state, time });
    }
};

export const logFirstExecution = partial(logGA, 'firstExecution');
export const logVisualizationExecuted = partial(logGA, 'executed');
export const logVisualizationExecutionFailed = partial(logGA, 'executionFailed');
export const logVisualizationDeleted = partial(logGA, 'deleted');
export const logVisualizationDeleteFailed = partial(logGA, 'deleteFailed');

import * as jqBrowser from 'jquery.browser';

/* eslint no-unused-vars: 0 */
export function isMobile(windowInstance) {
    // TODO: Make the function use the parameter.
    return !jqBrowser.desktop;
}

import { createSelector } from 'reselect';
import * as StatePaths from '../constants/StatePaths';

export default createSelector(
    state => state.getIn(StatePaths.ERRORS),
    state => state.getIn(StatePaths.APP_READY),
    state => state.getIn(StatePaths.PAGE_TITLE),
    state => state.getIn(StatePaths.FAVICON_URL),
    state => state.getIn(StatePaths.APPLE_TOUCH_ICON_URL),
    (errors, isAppReady, pageTitle, faviconUrl, appleTouchIconUrl) => ({
        errors,
        isAppReady,
        pageTitle,
        faviconUrl,
        appleTouchIconUrl
    })
);

import { Observable } from 'rxjs/Rx';

export const DROPDOWN_MIN_HEIGHT = 170;
export const DROPDOWN_MAX_HEIGHT = 360;
export const DROPDOWN_OFFSET_FROM_NODE = 5;
export const DROP_DOWN_BUTTON_HEIGHT = 30;
export const PADDING = 10;

export const EVENT_DEBOUNCE_MILISECONDS = 60;

const alignPoints = ['bl tl', 'tl bl', 'br tr', 'tr br'];

export const DROPDOWN_ALIGMENTS = alignPoints.map((align, idx) =>
    ({ align, offset: { x: 0, y: DROPDOWN_OFFSET_FROM_NODE * ((idx % 2) ? -1 : 1) } })
);

function calculateMaxHeight(buttonTop, windowObj) {
    const nodeAboveHeight = buttonTop - DROPDOWN_OFFSET_FROM_NODE - PADDING;
    const nodeBelowHeight = windowObj.innerHeight - (buttonTop + DROP_DOWN_BUTTON_HEIGHT + DROPDOWN_OFFSET_FROM_NODE + PADDING);

    return Math.max(nodeAboveHeight, nodeBelowHeight);
}

export function getDialogHeight(buttonTop, windowObj = window) {
    return Math.min(DROPDOWN_MAX_HEIGHT, Math.max(calculateMaxHeight(buttonTop, windowObj), DROPDOWN_MIN_HEIGHT));
}

export const DATE_DROPDOWN_ALIGMENTS = alignPoints.map(align => ({ align }));

const DATE_DROPDOWN_BODY_MARGIN = 6;
const UNRELATED_HEIGHT = 37;

export function getDateConfigurationDropdownHeight(dropdownButtonTop, dropdownButtonHeight, dropdownBodyHeight, hasFooter = false) {
    const nodeAboveHeight = dropdownButtonTop - 2 * DATE_DROPDOWN_BODY_MARGIN - PADDING - hasFooter * UNRELATED_HEIGHT;
    const nodeBelowHeight = window.innerHeight -
        (dropdownButtonTop + dropdownButtonHeight + 2 * DATE_DROPDOWN_BODY_MARGIN + PADDING + hasFooter * UNRELATED_HEIGHT);
    const maxHeight = Math.max(nodeAboveHeight, nodeBelowHeight);

    return Math.min(dropdownBodyHeight, maxHeight, DROPDOWN_MAX_HEIGHT);
}

export function subscribeEvents(func, events = ['scroll', 'resize']) {
    return events.map(event => {
        return Observable.fromEvent(window, event)
            .debounceTime(EVENT_DEBOUNCE_MILISECONDS)
            .subscribe(func);
    });
}

import { string } from 'js-utils';

export function getCssClass(value, prefix = '') {
    return prefix + string.simplifyText(value);
}

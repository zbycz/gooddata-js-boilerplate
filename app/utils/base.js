export function shortenText(value, options = {}) {
    const maxLength = options.maxLength;

    if (value && maxLength && value.length > maxLength) {
        return `${value.substr(0, maxLength - 1)}…`;
    }

    return value;
}

/**
 * Generates pseudo-random string.
 * @returns {string}
 */
export function randomString(len) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < len; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

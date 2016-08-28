import Promise from 'bluebird';

export function wrapPromise(promise) {
    return Promise.resolve(promise);
}

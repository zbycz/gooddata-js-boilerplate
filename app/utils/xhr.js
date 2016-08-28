import { wrapPromise } from '../utils/promises';
import sdk from 'gooddata';

export function post(uri, data) {
    const xhr = sdk.xhr.ajax(uri, {
        type: 'POST',
        data: JSON.stringify(data)
    });

    return wrapPromise(xhr);
}

export function put(uri, data) {
    const xhr = sdk.xhr.ajax(uri, {
        type: 'PUT',
        data: JSON.stringify(data)
    });

    return wrapPromise(xhr);
}

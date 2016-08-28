import { Map } from 'immutable';

// indexBy - converts immutable List to Map
// with properties set to specified key property of items
export function indexBy(iterable, searchKey) {
    return iterable.reduce((memo, item) => memo.set(item.get(searchKey), item), Map());
}

function isNormalInteger(str) {
    return /^\d+$/.test(str);
}

// string to key path - converts string path to key array
// for use with immutable selector methods
export function p(path) {
    return path.split('.').map(key => (isNormalInteger(key) ? Number(key) : key));
}

export function expectEqual(actual, expected) {
    expect(actual.toJS()).to.eql(expected.toJS());
}

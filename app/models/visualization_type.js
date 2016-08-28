import { fromJS } from 'immutable';
import { startCase } from 'lodash';

export const VISUALIZATION_TYPE_TABLE = 'table';
export const VISUALIZATION_TYPE_COLUMN = 'column';
export const VISUALIZATION_TYPE_BAR = 'bar';
export const VISUALIZATION_TYPE_LINE = 'line';

export const VISUALIZATION_TYPES = fromJS([
    VISUALIZATION_TYPE_TABLE,
    VISUALIZATION_TYPE_COLUMN,
    VISUALIZATION_TYPE_BAR,
    VISUALIZATION_TYPE_LINE]);

const VISUALIZATION_TYPE_OBJECTS = VISUALIZATION_TYPES.map(type => fromJS({ enabled: true, type, title: startCase(type) }));

export default VISUALIZATION_TYPE_OBJECTS;

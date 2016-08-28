import { DND_DATA } from '../constants/StatePaths';

export const dragFailed = state => ({ dragFailed: state.getIn([...DND_DATA, 'dragFailed'], false) });

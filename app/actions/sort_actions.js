import * as Actions from '../constants/Actions';
import { executeReport } from './report_actions';
import { log } from '../services/logger_service';
import { METRICS, CATEGORIES } from '../constants/bucket';
import { getProjectId } from '../selectors/bootstrap_selector';
import { getItem, getItemBucket } from '../selectors/buckets_selector';

const types = {
    [METRICS]: 'measure',
    [CATEGORIES]: 'attribute'
};

const logAction = (state, index) => {
    const projectId = getProjectId(state);
    // gather sort info details for log
    const item = getItem(state, index);
    const bucketName = getItemBucket(state, index);
    const columnType = types[bucketName];
    const direction = item.get('sort');
    const columns = index;

    log(projectId, 'adi-column-sorted', { column_type: columnType, direction, columns });
};

export const applySortTableChange =
    (column, index, dir) =>
        (dispatch, getState) => {
            const action = {
                type: Actions.SORT_TABLE_CHANGE,
                payload: { column, index, dir }
            };
            // dispatch action
            dispatch(action);
            // log sort info
            logAction(getState(), index);
            // and execute report
            executeReport()(dispatch, getState);
        };

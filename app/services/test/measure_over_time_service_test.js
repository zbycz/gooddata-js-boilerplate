import { getReportMDObject } from '../measure_over_time_service';
import initialState from '../../reducers/initial_state';
import * as StatePaths from '../../constants/StatePaths';
import { fromJS } from 'immutable';

describe('#getReportMDObject', () => {
    const expected = {
        type: 'column',
        buckets: {
            categories: [],
            filters: [],
            measures: [
                {
                    measure: {
                        format: '#,##0.00',
                        measureFilters: [],
                        showInPercent: false,
                        showPoP: false,
                        title: 'My dragged measure',
                        type: 'metric'
                    }
                }
            ]
        }
    };

    it('should return a report object from dragged object', () => {
        const MEASURE_ID = 'my-dragged-measure';

        const measure = fromJS({
            identifier: MEASURE_ID,
            title: 'My dragged measure',
            type: 'metric'
        });

        const state = initialState
            .setIn([...StatePaths.ITEM_CACHE, MEASURE_ID], measure)
            .setIn(StatePaths.ACTIVE_DRAG_ITEM, measure);

        const actual = getReportMDObject(state);

        expect(actual).to.eql(expected);
    });
});

import { fromJS } from 'immutable';

import * as Actions from '../../constants/Actions';
import sortReducer from '../sort_reducer';
import initialState from '../initial_state';
import { createDateItem } from '../../models/date_item';
import { bucketItem } from '../../models/bucket_item';
import * as Paths from '../../constants/StatePaths';
import { METRICS, CATEGORIES } from '../../constants/bucket';

describe('Sort Reducer tests', () => {
    describe('Apply Sort Change', () => {
        it('should set sort on measure', () => {
            const state = initialState
                .setIn([...Paths.BUCKETS, METRICS, 'items'], fromJS([bucketItem({}), bucketItem({})]));

            const newState = sortReducer(state, {
                type: Actions.SORT_TABLE_CHANGE,
                payload: {
                    index: 1,
                    dir: 'desc',
                    column: {
                        type: 'metric',
                        measureIndex: 1
                    }
                }
            });

            expect(newState.getIn([...Paths.BUCKETS, METRICS, 'items', 1, 'sort'])).to.eql({
                direction: 'desc'
            });
        });

        it('should set sort on attribute', () => {
            const state = initialState
                .setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([createDateItem({})]))
                .setIn([...Paths.BUCKETS, METRICS, 'items'], fromJS([bucketItem({}), bucketItem({})]));

            const newState = sortReducer(state, { type: Actions.SORT_TABLE_CHANGE, payload: { index: 0, dir: 'asc', column: { type: 'attrLabel' } } });

            expect(newState.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0, 'sort'])).to.eql('asc');
        });

        it('should set sort on measure when index is generated PoP column', () => {
            const state = initialState
                .setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([createDateItem({})]))
                .setIn([...Paths.BUCKETS, METRICS, 'items'], fromJS([bucketItem({ showPoP: true })]));

            const newState = sortReducer(state, {
                type: Actions.SORT_TABLE_CHANGE,
                payload: {
                    index: 1,
                    dir: 'desc',
                    column: {
                        type: 'metric',
                        measureIndex: 0,
                        isPoP: true
                    }
                }
            });

            expect(newState.getIn([...Paths.BUCKETS, METRICS, 'items', 0, 'sort'])).to.eql({
                direction: 'desc',
                sortByPoP: true
            });
        });
    });
});

import { fromJS } from 'immutable';
import initialState from '../../reducers/initial_state';
import { METRICS, CATEGORIES } from '../../constants/bucket';
import * as Paths from '../../constants/StatePaths';
import { TABLE } from '../../constants/visualizationTypes';
import { SORT_DIR_ASC, SORT_DIR_DESC } from '../../constants/sort_directions';
import { bucketItem } from '../../models/bucket_item';
import { updateSortInfo, __RewireAPI__ as RewireAPI } from '../sort';

describe('#sort', () => {
    let state;

    beforeEach(() => {
        state = initialState
            .setIn([...Paths.BUCKETS, METRICS, 'items'], fromJS([bucketItem({}), bucketItem({})]))
            .setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([bucketItem({}), bucketItem({})]));
    });

    describe('isSorted', () => {
        let isSorted;

        beforeEach(() => {
            isSorted = RewireAPI.__get__('isSorted');
        });

        describe('metrics', () => {
            it('should return false', () => {
                const res = isSorted(state, METRICS);

                expect(!!res).to.eql(false);
            });

            it('should return false', () => {
                state = state.setIn([...Paths.BUCKETS, METRICS, 'items', 0, 'sort'], SORT_DIR_DESC);
                const res = isSorted(state, METRICS);

                expect(!!res).to.eql(true);
            });
        });

        describe('categories', () => {
            it('should return false', () => {
                const res = isSorted(state, CATEGORIES);

                expect(!!res).to.eql(false);
            });

            it('should return false', () => {
                state = state.setIn([...Paths.BUCKETS, CATEGORIES, 'items', 0, 'sort'], SORT_DIR_DESC);
                const res = isSorted(state, CATEGORIES);

                expect(!!res).to.eql(true);
            });
        });
    });

    describe('updateSortInfo', () => {
        it('should return unchanged state when type is not table', () => {
            const updatedState = updateSortInfo(state);
            expect(updatedState).to.eql(state);
        });

        it('should return asc in first sorted category item for table type', () => {
            const tableState = state.setIn(Paths.VISUALIZATION_TYPE, TABLE);
            const updatedState = updateSortInfo(tableState);
            const firstCategorySort = updatedState.getIn([...Paths.BUCKETS, CATEGORIES, 'items', 0, 'sort']);
            expect(firstCategorySort).to.eql(SORT_DIR_ASC);
        });

        it('should return desc MeasureSort in first sorted measure item for table type', () => {
            const tableWithoutCategoryState = state
                .setIn(Paths.VISUALIZATION_TYPE, TABLE)
                .setIn([...Paths.BUCKETS, CATEGORIES, 'items'], fromJS([]));
            const updatedState = updateSortInfo(tableWithoutCategoryState);
            const firstMeasureSort = updatedState.getIn([...Paths.BUCKETS, METRICS, 'items', 0, 'sort']);
            expect(firstMeasureSort).to.eql({
                direction: SORT_DIR_DESC
            });
        });
    });
});

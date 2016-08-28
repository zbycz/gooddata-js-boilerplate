import { fromJS } from 'immutable';

import { createReport } from '../report';
import initialState from '../../reducers/initial_state';
import * as StatePaths from '../../constants/StatePaths';
import * as TestMocks from '../../constants/TestMocks';

describe('report', () => {
    describe('#isEmpty', () => {
        const state = initialState
            .setIn(StatePaths.ITEM_CACHE, fromJS(TestMocks.itemCache));

        const withMetrics = state
            .setIn(StatePaths.BUCKETS_METRICS_ITEMS, fromJS(TestMocks.metricBucketItems));

        const withCategories = state
            .setIn(StatePaths.BUCKETS_CATEGORIES_ITEMS, fromJS(TestMocks.categoriesBucketItems));

        const withFilters = state
            .setIn(StatePaths.BUCKETS_FILTERS_ITEMS, fromJS(TestMocks.filterBucketItems));

        it('should be empty by default', () => {
            expect(createReport(initialState).isEmpty()).to.eql(true);
        });

        it('should not be empty with metrics', () => {
            expect(createReport(withMetrics).isEmpty()).to.eql(false);
        });

        it('should not be empty with categories', () => {
            expect(createReport(withCategories).isEmpty()).to.eql(false);
        });

        it('should be empty with filters only', () => {
            expect(createReport(withFilters).isEmpty()).to.eql(true);
        });
    });
});

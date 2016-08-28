import selector from '../configuration_checkboxes_selector';
import initialState from '../../reducers/initial_state';
import * as StatePaths from '../../constants/StatePaths';
import { List, fromJS } from 'immutable';
import { METRICS, CATEGORIES, FILTERS } from '../../constants/bucket';
import { LAST_7_DAYS, ALL_TIME } from '../../constants/presets';
import { DATE_DATASET_ATTRIBUTE } from '../../models/date_item';

describe('configurationCheckboxesSelector', () => {
    const item = fromJS({ attribute: 'foo' });
    const dateItem = fromJS({ attribute: DATE_DATASET_ATTRIBUTE });
    const dateFilter = fromJS({ attribute: DATE_DATASET_ATTRIBUTE, filters: [{ interval: { name: LAST_7_DAYS } }] });

    describe('isShowInPercentDisabled', () => {
        it('should be true by default', () => {
            const { isShowInPercentDisabled } = selector(initialState);

            expect(isShowInPercentDisabled).to.equal(true);
        });

        it('should be false if conditions met', () => {
            const state = initialState
                .setIn([...StatePaths.BUCKETS, METRICS, 'items'], List.of(item))
                .setIn([...StatePaths.BUCKETS, CATEGORIES, 'items'], List.of(item));

            const { isShowInPercentDisabled } = selector(state);

            expect(isShowInPercentDisabled).to.equal(false);
        });
    });

    describe('isShowPoPDisabled', () => {
        it('should be true by default', () => {
            const { isShowInPercentDisabled } = selector(initialState);

            expect(isShowInPercentDisabled).to.equal(true);
        });

        it('should be true if date filter is not modified', () => {
            const dateFilterNotModified = dateFilter
                .setIn(['filters', 0, 'interval'], null);

            const state = initialState
                .setIn([...StatePaths.BUCKETS, METRICS, 'items'], List.of(item))
                .setIn([...StatePaths.BUCKETS, FILTERS, 'items'], List.of(dateFilterNotModified));

            const { isShowPoPDisabled } = selector(state);

            expect(isShowPoPDisabled).to.equal(true);
        });

        it('should be true if date filter is set to all', () => {
            const dateFilterAllTime = dateFilter
                .setIn(['filters', 0, 'interval', 'name'], ALL_TIME);

            const state = initialState
                .setIn([...StatePaths.BUCKETS, METRICS, 'items'], List.of(item))
                .setIn([...StatePaths.BUCKETS, FILTERS, 'items'], List.of(dateFilterAllTime));

            const { isShowPoPDisabled } = selector(state);

            expect(isShowPoPDisabled).to.equal(true);
        });

        it('should be false if conditions met (date in category)', () => {
            const state = initialState
                .setIn([...StatePaths.BUCKETS, METRICS, 'items'], List.of(item))
                .setIn([...StatePaths.BUCKETS, CATEGORIES, 'items'], List.of(dateItem));

            const { isShowPoPDisabled } = selector(state);

            expect(isShowPoPDisabled).to.equal(false);
        });

        it('should be false if conditions met (modified date filter)', () => {
            const state = initialState
                .setIn([...StatePaths.BUCKETS, METRICS, 'items'], List.of(item))
                .setIn([...StatePaths.BUCKETS, CATEGORIES, 'items'], List.of(item))
                .setIn([...StatePaths.BUCKETS, FILTERS, 'items'], List.of(dateFilter));

            const { isShowPoPDisabled } = selector(state);

            expect(isShowPoPDisabled).to.equal(false);
        });
    });
});

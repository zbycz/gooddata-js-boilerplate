import { isResetDisabledSelector, __RewireAPI__ as ResetButtonSelectorRewireApi } from '../reset_button_selector';
import initialState from '../../reducers/initial_state';
import * as Paths from '../../constants/StatePaths';
import { BAR, LINE, TABLE } from '../../constants/visualizationTypes';

describe('isResetDisabledSelector', () => {
    it('should return true if the state is untuched', () => {
        expect(isResetDisabledSelector(initialState)).to.be.true();
    });

    it('should return false when there items in any buckets', () => {
        let state = initialState.setIn(Paths.BUCKETS_METRICS_ITEMS, [1]);
        expect(isResetDisabledSelector(state)).to.be.false();

        state = initialState.setIn(Paths.BUCKETS_CATEGORIES_ITEMS, [1]);
        expect(isResetDisabledSelector(state)).to.be.false();

        state = initialState.setIn(Paths.BUCKETS_STACKS_ITEMS, [1]);
        expect(isResetDisabledSelector(state)).to.be.false();

        state = initialState.setIn(Paths.BUCKETS_FILTERS_ITEMS, [1]);
        expect(isResetDisabledSelector(state)).to.be.false();
    });

    it('should return false if the visualization type has changed', () => {
        let state = initialState.setIn(Paths.VISUALIZATION_TYPE, BAR);
        expect(isResetDisabledSelector(state)).to.be.false();

        state = initialState.setIn(Paths.VISUALIZATION_TYPE, LINE);
        expect(isResetDisabledSelector(state)).to.be.false();

        state = initialState.setIn(Paths.VISUALIZATION_TYPE, TABLE);
        expect(isResetDisabledSelector(state)).to.be.false();
    });

    it('should return true if reset is disabled by timeTravelReducer.isResetDisabledByLastAction()', () => {
        ResetButtonSelectorRewireApi.__Rewire__('isResetDisabledByLastAction', () => true);

        let state = initialState.setIn(Paths.BUCKETS_METRICS_ITEMS, [1]);
        expect(isResetDisabledSelector(state)).to.be.true();

        ResetButtonSelectorRewireApi.__ResetDependency__('isResetDisabledByLastAction');
    });
});

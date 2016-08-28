import { fromJS } from 'immutable';
import activeFilterSelector from '../active_filter_selector';

describe('activeFilterSelector', () => {
    const state = fromJS({
        data: {
            catalogue: {
                activeFilterIndex: 1,
                filters: ['foo', 'bar']
            }
        }
    });

    it('returns active filter', () => {
        expect(activeFilterSelector(state)).to.equal('bar');
    });
});

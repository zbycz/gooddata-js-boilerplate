import reportTitleSelector from '../report_title_selector';
import * as StatePaths from '../../constants/StatePaths';
import initialState from '../../reducers/initial_state';

describe('Report title selector test', () => {
    it('everything should be disabled by default', () => {
        const state = initialState;
        const selector = reportTitleSelector(state);

        expect(selector).to.eql({
            currentTitle: '',
            isTitleDefined: false
        });
    });

    it('should have correct report title', () => {
        const title = 'My title';

        const state = initialState.setIn(StatePaths.REPORT_CURRENT_TITLE, title);
        const selector = reportTitleSelector(state);

        expect(selector).to.eql({
            currentTitle: title,
            isTitleDefined: true
        });
    });
});

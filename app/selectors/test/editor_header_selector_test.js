import editorHeaderSelector from '../editor_header_selector';
import * as StatePaths from '../../constants/StatePaths';
import initialState from '../../reducers/initial_state';

describe('Editor header selector test', () => {
    it('everything should be disabled by default', () => {
        const state = initialState;
        const selector = editorHeaderSelector(state);

        expect(selector).to.eql({
            isUndoDisabled: true,
            isRedoDisabled: true,
            isResetDisabled: true,
            isSaveDisabled: true,
            isTitleDisabled: false,
            isReportSaved: false,
            isEmbedded: false
        });
    });

    it('everything should be disabled when report saving', () => {
        const state = initialState.setIn(StatePaths.REPORT_SAVING, true);
        const selector = editorHeaderSelector(state);

        expect(selector).to.eql({
            isUndoDisabled: true,
            isRedoDisabled: true,
            isResetDisabled: true,
            isSaveDisabled: true,
            isTitleDisabled: false,
            isReportSaved: false,
            isEmbedded: false
        });
    });

    it('should disable undo selectively when not saving', () => {
        const state = initialState.setIn(StatePaths.UNDO_POSSIBLE, true);
        const selector = editorHeaderSelector(state);

        expect(selector).to.eql({
            isUndoDisabled: false,
            isRedoDisabled: true,
            isResetDisabled: true,
            isSaveDisabled: true,
            isTitleDisabled: false,
            isReportSaved: false,
            isEmbedded: false
        });
    });
});

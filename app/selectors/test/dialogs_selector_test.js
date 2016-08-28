import { dialogsSelector } from '../dialogs_selector';
import initialState from '../../reducers/initial_state';
import * as StatePaths from '../../constants/StatePaths';

describe('dialogsSelector', () => {
    it('should return openReportDialog flag false if open report dialog is not active', () => {
        expect(dialogsSelector(initialState).openReportDialog.toJS()).to.eql({
            active: false,
            data: null
        });
    });

    it('should return saving untitled dialog when no title present', () => {
        const updatedState = initialState.setIn(StatePaths.DIALOGS_SAVING_UNTITLED_REPORT_CONFIRMATION, true);
        expect(dialogsSelector(updatedState).savingUntitledReportDialog).to.equal(true);
    });

    it('should return correct title when present', () => {
        const reportTitle = 'title';
        const updatedState = initialState.setIn(StatePaths.REPORT_CURRENT_TITLE, reportTitle);
        expect(dialogsSelector(updatedState).reportTitle).to.equal(reportTitle);
    });

    it('should return deleteReportDialog flag false if delete report dialog is not active, ', () => {
        expect(dialogsSelector(initialState).deleteReportDialog.toJS()).to.eql({
            active: false,
            data: null
        });
    });
});

import { SaveReportDialog } from '../SaveReportDialog';
import { fromJS } from 'immutable';

import * as DialogUtils from './dialog_utils';

describe('SaveReportDialog', () => {
    const render = DialogUtils.createRendererFor(SaveReportDialog);
    let onSavingUntitledReportDialogConfirm, dialogConfig;

    beforeEach(() => {
        onSavingUntitledReportDialogConfirm = sinon.stub();
        dialogConfig = {
            savingUntitledReportDialog: fromJS({
                active: true
            }),
            reportTitle: 'not empty',
            onHideDialog: () => {},
            onChangeReportTitleInput: () => {},
            onSavingUntitledReportDialogConfirm
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should handle save click when title not empty', () => {
        const dialog = render({
            ...dialogConfig,
            reportTitle: 'not empty'
        });

        DialogUtils.dialogClickSubmit(dialog);

        expect(onSavingUntitledReportDialogConfirm).to.be.calledOnce();
    });

    it('should NOT handle save click when title empty', () => {
        const dialog = render({
            ...dialogConfig,
            reportTitle: ''
        });

        DialogUtils.dialogClickSubmit(dialog);

        expect(onSavingUntitledReportDialogConfirm).not.to.be.called();
    });

    it('should NOT be able to submit with enter when title empty', () => {
        const dialog = render({
            ...dialogConfig,
            reportTitle: ''
        });

        DialogUtils.dialogEnterSubmit(dialog);
        expect(onSavingUntitledReportDialogConfirm).not.to.be.called();
    });

    it('should be able to submit with enter when title not empty', () => {
        const dialog = render({
            ...dialogConfig,
            reportTitle: 'title'
        });

        DialogUtils.dialogEnterSubmit(dialog);
        expect(onSavingUntitledReportDialogConfirm).to.be.calledOnce();
    });

    it('should handle cancel click', () => {
        const onHideDialog = sinon.stub();
        const onChangeReportTitleInput = sinon.stub();

        const dialog = render({
            ...dialogConfig,
            reportTitle: 'not empty',
            onHideDialog,
            onChangeReportTitleInput
        });

        DialogUtils.dialogClickCancel(dialog);

        expect(onHideDialog).to.be.calledOnce();
    });
});

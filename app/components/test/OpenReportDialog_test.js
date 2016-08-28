import { fromJS } from 'immutable';

import { OpenReportDialog } from '../OpenReportDialog';
import * as DialogUtils from './dialog_utils';

describe('OpenReportDialog', () => {
    const render = DialogUtils.createRendererFor(OpenReportDialog);

    it('should handle confirm click', () => {
        const onOpenReportDialogConfirm = sinon.stub();

        const dialog = render({
            openReportDialog: fromJS({
                active: true,
                data: { foo: 'bar' }
            }),
            onHideDialog: () => {},
            onOpenReportDialogConfirm
        });

        DialogUtils.dialogClickSubmit(dialog);

        expect(onOpenReportDialogConfirm).to.be.calledOnce();
        expect(onOpenReportDialogConfirm).to.be.calledWith(fromJS({ foo: 'bar' }));
    });

    it('should handle cancel click', () => {
        const onHideDialog = sinon.stub();

        const dialog = render({
            openReportDialog: fromJS({
                active: true,
                data: { foo: 'bar' }
            }),
            onHideDialog,
            onOpenReportDialogConfirm: () => {}
        });

        DialogUtils.dialogClickCancel(dialog);

        expect(onHideDialog).to.be.calledOnce();
    });
});

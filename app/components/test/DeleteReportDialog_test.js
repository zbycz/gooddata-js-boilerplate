import { fromJS } from 'immutable';
import ReactTestUtils from 'react-addons-test-utils';

import { DeleteReportDialog } from '../DeleteReportDialog';
import * as DialogUtils from './dialog_utils';

describe('DeleteReportDialog', () => {
    const render = DialogUtils.createRendererFor(DeleteReportDialog);

    it('should not display anything when not active', () => {
        const dialog = render({
            deleteReportDialog: fromJS({
                active: false
            }),
            onHideDialog: () => {},
            onDeleteReportDialogConfirm: () => {}
        });

        expect(ReactTestUtils.isDOMComponent(dialog)).to.not.be.ok();
    });

    it('should handle confirm click', () => {
        const onDeleteReportDialogConfirm = sinon.stub();

        const dialog = render({
            deleteReportDialog: fromJS({
                active: true
            }),
            onHideDialog: () => {},
            onDeleteReportDialogConfirm
        });

        DialogUtils.dialogClickSubmit(dialog);

        expect(onDeleteReportDialogConfirm).to.be.calledOnce();
    });

    it('should handle cancel click', () => {
        const onHideDialog = sinon.stub();

        const dialog = render({
            deleteReportDialog: fromJS({
                active: true
            }),
            onHideDialog,
            onDeleteReportDialogConfirm: () => {}
        });

        DialogUtils.dialogClickCancel(dialog);

        expect(onHideDialog).to.be.calledOnce();
    });
});

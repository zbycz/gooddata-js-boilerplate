import React, { Component, PropTypes } from 'react';
import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import * as DialogsActions from '../actions/dialogs_actions';
import * as OpenActions from '../actions/open_actions';
import ConfirmDialogComponent from 'goodstrap/packages/Dialog/ReactConfirmDialog';
import { dialogsSelector } from '../selectors/dialogs_selector';

import { t } from '../utils/translations';

export class OpenReportDialog extends Component {
    static propTypes = {
        openReportDialog: PropTypes.object,
        onHideDialog: PropTypes.func,
        onOpenReportDialogConfirm: PropTypes.func,
        ConfirmDialog: PropTypes.any
    };

    static defaultProps = {
        openReportDialog: fromJS({ active: false }),
        ConfirmDialog: ConfirmDialogComponent
    };

    render() {
        const {
            ConfirmDialog,
            openReportDialog
        } = this.props;

        if (openReportDialog.get('active')) {
            return (
                <ConfirmDialog
                    onCancel={this.props.onHideDialog}
                    onSubmit={() => this.props.onOpenReportDialogConfirm(openReportDialog.get('data'))}
                    className="s-dialog"
                    headline={t('dialogs.openReportConfirmation.headline')}
                    cancelButtonText={t('dialogs.openReportConfirmation.cancel')}
                    submitButtonText={t('dialogs.openReportConfirmation.confirm')}
                >
                    <p>{t('dialogs.openReportConfirmation.description')}</p>
                </ConfirmDialog>
            );
        }

        return false;
    }
}

const mapDispatchToProps = dispatch => ({
    onHideDialog(payload) {
        dispatch(DialogsActions.hideDialog(payload));
    },
    onOpenReportDialogConfirm(report) {
        dispatch(OpenActions.openReport({
            report,
            forceOpen: true
        }));
    }
});

export default connect(dialogsSelector, mapDispatchToProps)(OpenReportDialog);

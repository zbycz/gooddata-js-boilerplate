import React, { Component, PropTypes } from 'react';
import { FormattedHTMLMessage } from 'react-intl';
import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import * as DialogsActions from '../actions/dialogs_actions';
import * as DeleteActions from '../actions/delete_actions';
import ConfirmDialogComponent from 'goodstrap/packages/Dialog/ReactConfirmDialog';
import { dialogsSelector } from '../selectors/dialogs_selector';
import { shortenText } from '../utils/base';

import { t } from '../utils/translations';

const MAX_TITLE_LENGTH = 28;

export class DeleteReportDialog extends Component {
    static propTypes = {
        deleteReportDialog: PropTypes.object,
        onHideDialog: PropTypes.func,
        onDeleteReportDialogConfirm: PropTypes.func,
        deletedReportTitle: PropTypes.string,
        ConfirmDialog: PropTypes.any
    };

    static defaultProps = {
        deleteReportDialog: fromJS({ active: false }),
        ConfirmDialog: ConfirmDialogComponent
    };

    render() {
        const {
            ConfirmDialog,
            deleteReportDialog,
            deletedReportTitle
        } = this.props;

        const decoratedTitle = shortenText(deletedReportTitle, {
            maxLength: MAX_TITLE_LENGTH
        });

        if (deleteReportDialog.get('active')) {
            return (
                <ConfirmDialog
                    onCancel={this.props.onHideDialog}
                    onSubmit={() => this.props.onDeleteReportDialogConfirm(deleteReportDialog.get('data'))}
                    className="s-dialog"
                    headline={t('dialogs.deleteReportConfirmation.headline')}
                    cancelButtonText={t('dialogs.deleteReportConfirmation.cancel')}
                    submitButtonText={t('dialogs.deleteReportConfirmation.confirm')}
                >
                    <p>
                        <FormattedHTMLMessage
                            id="dialogs.deleteReportConfirmation.description"
                            values={{ deletedReportTitle: decoratedTitle }}
                        />
                    </p>
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
    onDeleteReportDialogConfirm(report) {
        dispatch(DeleteActions.deleteReport({
            report,
            forceDelete: true
        }));
    }
});

export default connect(dialogsSelector, mapDispatchToProps)(DeleteReportDialog);

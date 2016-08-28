import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { bindAll } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import * as DialogsActions from '../actions/dialogs_actions';
import ConfirmDialogComponent from 'goodstrap/packages/Dialog/ReactConfirmDialog';
import { dialogsSelector } from '../selectors/dialogs_selector';

import * as SaveActions from '../actions/save_actions';
import * as ReportActions from '../actions/report_actions';
import { t } from '../utils/translations';
import { MAX_TITLE_LENGTH } from './ReportTitle';

export class SaveReportDialog extends Component {
    static propTypes = {
        onHideDialog: PropTypes.func,
        savingUntitledReportDialog: PropTypes.object,
        onSavingUntitledReportDialogConfirm: PropTypes.func,
        reportTitle: PropTypes.string,
        ConfirmDialog: PropTypes.any
    };

    static defaultProps = {
        savingUntitledReportDialog: fromJS({ active: false }),
        ConfirmDialog: ConfirmDialogComponent
    };

    constructor(props) {
        super(props);

        bindAll(this, ['onValueChange', 'onSubmit']);
        this.state = {
            value: props.reportTitle || ''
        };
    }

    componentWillReceiveProps(nextProps) {
        const isDialogClosing = !nextProps.savingUntitledReportDialog.get('active') && this.props.savingUntitledReportDialog.get('active');
        const hasReportTitle = this.state.value;

        if (isDialogClosing && hasReportTitle) {
            this.resetReportTitle();
        }
    }

    componentDidUpdate() {
        const input = ReactDOM.findDOMNode(this.refs.input);
        // https://github.com/facebook/react/issues/1791
        setTimeout(() => input && input.focus(), 0);
    }

    onValueChange(e) {
        this.setState({
            value: e.target.value.trim()
        });
    }

    onSubmit() {
        if (this.state.value === '') {
            return;
        }

        const isSaveAsNew = this.props.savingUntitledReportDialog.getIn(['data', 'saveAsNew']);
        this.props.onSavingUntitledReportDialogConfirm(this.state.value, isSaveAsNew);
    }

    resetReportTitle() {
        this.setState({ value: '' });
    }

    render() {
        const ConfirmDialog = this.props.ConfirmDialog;

        if (this.props.savingUntitledReportDialog.get('active')) {
            return (
                <ConfirmDialog
                    isPositive
                    onCancel={this.props.onHideDialog}
                    onSubmit={this.onSubmit}
                    className="s-dialog"
                    headline={t('dialogs.savingUntitledReportConfirmation.headline')}
                    cancelButtonText={t('dialogs.savingUntitledReportConfirmation.cancel')}
                    submitButtonText={t('dialogs.savingUntitledReportConfirmation.confirm')}
                    isSubmitDisabled={!this.state.value}
                >
                    <p>
                        <FormattedMessage id="dialogs.savingUntitledReportConfirmation.description" />
                    </p>
                    <input
                        type="text"
                        ref="input"
                        maxLength={MAX_TITLE_LENGTH}
                        onChange={this.onValueChange}
                        placeholder={t('dialogs.savingUntitledReportConfirmation.placeholder')}
                        className="input-text name-insight-dialog-input"
                    />
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
    onSavingUntitledReportDialogConfirm(value, isSaveAsNew) {
        dispatch(DialogsActions.hideDialog());
        dispatch(ReportActions.reportTitleChange(value));
        dispatch(SaveActions.saveReport(isSaveAsNew));
    }
});

export default connect(dialogsSelector, mapDispatchToProps)(SaveReportDialog);

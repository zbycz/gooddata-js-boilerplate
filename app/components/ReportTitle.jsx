import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import reportTitleSelector from '../selectors/report_title_selector';
import * as ReportActions from '../actions/report_actions';
import EditableLabel from 'goodstrap/packages/EditableLabel/ReactEditableLabel';

import { t } from '../utils/translations';

export const MAX_TITLE_LENGTH = 255;

export class ReportTitle extends Component {
    static propTypes = {
        onTitleChange: PropTypes.func,
        isTitleDefined: PropTypes.bool,
        currentTitle: PropTypes.string
    };

    getEditableLabelClassNames() {
        return classNames({
            'has-defined-title': this.props.isTitleDefined,
            'report-title': true,
            's-report-title': true
        });
    }

    render() {
        const {
            onTitleChange
        } = this.props;

        return (
            <EditableLabel
                textareaInOverlay={false}
                value={this.props.currentTitle}
                maxLength={MAX_TITLE_LENGTH}
                maxRows={1}
                onSubmit={onTitleChange}
                className={this.getEditableLabelClassNames()}
                placeholder={t('dialogs.savingUntitledReportConfirmation.placeholder')}
            />
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        onTitleChange(title) {
            dispatch(ReportActions.reportTitleChange(title));
        }
    };
}

export default connect(reportTitleSelector, mapDispatchToProps)(ReportTitle);

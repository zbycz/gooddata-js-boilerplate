import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Button from 'Button/ReactButton';
import * as SaveActions from '../../actions/save_actions';
import { saveReportSelector } from '../../selectors/save_report_selector';

import { t } from '../../utils/translations';

export const SaveReportButton = props => {
    return (
        <Button
            className="s-save-button save-button button-action"
            onClick={() => props.saveReportCheck(false)}
            value={props.isSaving ? t('saving') : t('save')}
            disabled={props.isDisabled}
        />
    );
};

SaveReportButton.propTypes = {
    ...Button.propTypes,
    saveReportCheck: PropTypes.func,
    isSaving: PropTypes.bool,
    isDisabled: PropTypes.bool
};

export default connect(saveReportSelector, SaveActions)(SaveReportButton);

import React from 'react';
import { connect } from 'react-redux';
import Button from 'Button/ReactButton';
import * as SaveActions from '../../actions/save_actions';
import { saveAsNewReportSelector } from '../../selectors/save_report_selector';
import { SaveReportButton } from './SaveReportButton';

import { t } from '../../utils/translations';

const SaveAsNewReportButton = props => {
    return (
        <Button
            className="s-save-as-new-button save-as-new-button button-secondary"
            onClick={() => props.saveReportCheck(true)}
            value={props.isSaving ? t('saving') : t('save_as_new')}
            disabled={props.isDisabled}
        />
    );
};

SaveAsNewReportButton.propTypes = SaveReportButton.propTypes;

export default connect(saveAsNewReportSelector, SaveActions)(SaveAsNewReportButton);

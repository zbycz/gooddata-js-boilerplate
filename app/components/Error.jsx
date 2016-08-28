import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { errorSelector } from '../selectors/error_selector';
import * as Errors from '../constants/Errors';

import '../styles/error.scss';

export class Error extends Component {
    static propTypes = {
        projectId: PropTypes.string.isRequired,
        errors: PropTypes.object.isRequired
    };

    getErrorId() {
        const error = this.props.errors.last();
        if (!error) {
            return null;
        }

        switch (error.type) {
            case Errors.ACCESS_DESIGNER_DENIED_ERROR:
            case Errors.NOT_AUTHORIZED_ERROR:
            case Errors.CREATE_REPORT_DENIED_ERROR:
                return 'error.access';

            case Errors.ACCESS_WORKBENCH_DENIED_ERROR:
                return 'error.project.access';

            case Errors.PROJECT_NOT_FOUND_ERROR:
                return 'error.project.not_found';

            case Errors.NO_PROJECT_AVAILABLE_ERROR:
                return 'error.no_project_available';

            default:
                return 'error.general';
        }
    }

    render() {
        const { projectId } = this.props;
        const errorId = this.getErrorId();

        return errorId ? (
            <div className="main-error">
                <div className="adi-canvas-message s-canvas-message">
                    <h2><FormattedMessage id={`${errorId}.message`} values={{ projectId }} /></h2>
                    <p><FormattedMessage id={`${errorId}.description`} values={{ projectId }} /></p>
                </div>
            </div>
        ) : null;
    }
}

export default connect(errorSelector)(Error);

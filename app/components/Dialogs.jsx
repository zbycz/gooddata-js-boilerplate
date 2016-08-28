import React, { Component } from 'react';
import OpenReportDialog from './OpenReportDialog';
import DeleteReportDialog from './DeleteReportDialog';
import SaveReportDialog from './SaveReportDialog';

export default class Dialogs extends Component {
    render() {
        return (
            <div className="dialogs-section">
                <OpenReportDialog />
                <DeleteReportDialog />
                <SaveReportDialog />
            </div>
        );
    }
}

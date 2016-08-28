import React from 'react';
import ReportMessage from './ReportMessage';

export default function ReportInvalidConfiguration() {
    return (
        <ReportMessage
            messageId="invalid_configuration"
            className="adi-canvas-message-invalid-conf s-error-invalid-configuration"
        />
    );
}

import React from 'react';
import ReportMessage from './ReportMessage';

export default function ReportEmpty() {
    return (
        <ReportMessage
            messageId="empty"
            className="adi-canvas-message-empty-result s-error-empty-result"
        />
    );
}

export function createTestLogging() {
    const messageLog = [];

    function log(projectId, message, params) {
        messageLog.push({ projectId, message, params });
    }

    function formatter(action) {
        return {
            message: action.type,
            params: { ...action, type: undefined }
        };
    }

    function findLogEntry(predicate) {
        return messageLog.find(predicate);
    }

    function findLogEntryByMessage(message) {
        return findLogEntry(logEntry => logEntry.message === message);
    }

    return {
        log,
        formatter,
        findLogEntry,
        findLogEntryByMessage
    };
}

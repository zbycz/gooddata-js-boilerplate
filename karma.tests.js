const testsContext = require.context('./app', true, /_test\.jsx?$/);
testsContext.keys().forEach(testsContext);

// Convert React PropTypes validation to errors
/* eslint-disable no-console */
const consoleError = console.error;
console.error = (warning, args) => {
    if (/(Invalid prop|Failed propType)/.test(warning)) {
        throw new Error(warning);
    }
    consoleError.apply(console, args);
};

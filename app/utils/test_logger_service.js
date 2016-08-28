import { set } from 'lodash';

const methods = [
    'logVisualizationDeleted',
    'logVisualizationDeleteFailed',
    'logVisualizationExecuted',
    'logVisualizationExecutionFailed',
    'logVisualizationSavedAsNew',
    'logVisualizationUpdated',
    'logVisualizationFirstSave',
    'logVisualizationSaved',
    'logVisualizationSaveAsNewFailed',
    'logVisualizationUpdateFailed',
    'logVisualizationFirstSaveFailed',
    'logVisualizationSaveFailed',
    'logAccessingAD',
    'logOpenAsReport',
    'logFirstExecution',
    'logADClear',
    'logVisualizationOpen'
];

export const createLoggerService = () =>
    methods.reduce((result, method) => set(result, method, sinon.stub()), {});

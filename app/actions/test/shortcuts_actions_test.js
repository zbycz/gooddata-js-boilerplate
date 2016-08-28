import { createActionStore } from '../../utils/test_action_store';
import { bucketItem } from '../../models/bucket_item';
import {
    REPORT_EXECUTION,
    SHORTCUT_SET_DROPPED_ITEM,
    SHORTCUT_APPLY_METRIC_OVER_TIME,
    SHORTCUT_DATE_DATASETS_UPDATE,
    SHORTCUT_DATE_DATASETS_UPDATED
} from '../../constants/Actions';

import {
    PROJECT_ID,
    SHORTCUT_DROPPED_ITEM,
    SHORTCUT_DATE_DATASETS_LOADED,
    CATALOGUE_ACTIVE_DATASET_ID
} from '../../constants/StatePaths';

import * as Actions from '../shortcuts_actions'; // eslint-disable-line
import { __RewireAPI__ as ActionsRewireApi } from '../shortcuts_actions'; // eslint-disable-line

describe('Shortcuts actions', () => {
    let actionStore, dispatch, findActionByType, messageLog;
    const testItem = bucketItem({});

    function logMessage(projectId, message, params) {
        messageLog.push({ projectId, message, params });
    }

    const simpleFormatter = action => ({ message: action.type, params: action.payload });

    function createDependencies(attrs = {}) {
        return {
            ...attrs,
            log: logMessage,
            formatter: simpleFormatter
        };
    }

    function createExecutionReportDependencies() {
        return createDependencies({
            execute: () => ({ type: REPORT_EXECUTION })
        });
    }

    function expectActionLogged(index = 0) {
        const { message, params } = messageLog[index];

        const action = findActionByType(message);

        expect(action).to.be.ok();
        expect(action.payload).to.eql(params);
    }

    function expectExecutedReport() {
        expect(findActionByType(REPORT_EXECUTION)).to.be.ok();
    }

    beforeEach(() => {
        messageLog = [];

        actionStore = createActionStore();

        dispatch = actionStore.dispatch;
        findActionByType = actionStore.findActionByType;

        actionStore.setState(
            actionStore.getState()
                .setIn(PROJECT_ID, 'my-project-id')
                .setIn(CATALOGUE_ACTIVE_DATASET_ID, 'my-dataset-id')
        );
    });

    describe('#applyAttributeShortcut', () => {
        const creator = Actions.applyAttributeShortcut;
        const dependencies = createExecutionReportDependencies();

        beforeEach(() => {
            dispatch(creator(testItem, dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });
    });

    describe('#applyMetricShortcut', () => {
        const creator = Actions.applyMetricShortcut;
        const dependencies = createExecutionReportDependencies();

        beforeEach(() => {
            dispatch(creator(testItem, dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });
    });

    describe('#applyMetricOverTimeShortcut', () => {
        const creator = Actions.applyMetricOverTimeShortcut;
        const dependencies = createExecutionReportDependencies();

        beforeEach(() => {
            dispatch(creator(testItem, dependencies));
        });

        it('should execute report', () => {
            expectExecutedReport();
        });

        it('should create a log entry', () => {
            expectActionLogged();
        });
    });

    describe('#dropCatalogueItem', () => {
        it('should set dropped item by default', () => {
            dispatch(Actions.dropCatalogueItem(testItem));

            expect(findActionByType(SHORTCUT_SET_DROPPED_ITEM)).to.be.ok();
        });

        it('should trigger metric over time shortcut if datasets were loaded meanwhile', () => {
            actionStore.setState(actionStore.getState().setIn(SHORTCUT_DATE_DATASETS_LOADED, true));

            dispatch(Actions.dropCatalogueItem(testItem));

            expect(findActionByType(SHORTCUT_SET_DROPPED_ITEM)).to.equal(undefined);
        });
    });

    describe('#loadShortcutDateDataSets', () => {
        const data = { foo: 'bar' };
        const reportMDObject = { report: 'yay' };
        const loadDateDataSets = sinon.stub().returns(Promise.resolve(data));
        const getReportMDObject = sinon.stub().returns(reportMDObject);

        const creator = Actions.loadShortcutDateDataSets;

        beforeEach(() => {
            ActionsRewireApi.__Rewire__('loadDateDataSets', loadDateDataSets);
            ActionsRewireApi.__Rewire__('getReportMDObject', getReportMDObject);
        });

        afterEach(() => {
            ActionsRewireApi.__ResetDependency__('loadDateDataSets');
            ActionsRewireApi.__ResetDependency__('getReportMDObject');
        });

        it('should dispatch loading started action', () => {
            return dispatch(creator()).then(() => {
                expect(findActionByType(SHORTCUT_DATE_DATASETS_UPDATE)).to.be.ok();
            });
        });

        it('should dispatch load finished action with the data', () => {
            return dispatch(creator()).then(() => {
                const action = findActionByType(SHORTCUT_DATE_DATASETS_UPDATED);

                expect(action).to.be.ok();
                expect(action.payload).to.eql(data);
            });
        });

        it('should send project ID and MD object to the api function', () => {
            return dispatch(creator()).then(() => {
                expect(loadDateDataSets).to.be.calledWith('my-project-id',
                    { bucketItems: reportMDObject, dataSetIdentifier: 'my-dataset-id' });
            });
        });

        context('shortcut execution', () => {
            it('should not trigger metric over time shortcut by default', () => {
                return dispatch(creator()).then(() => {
                    expect(findActionByType(SHORTCUT_APPLY_METRIC_OVER_TIME)).to.equal(undefined);
                });
            });

            it('should trigger metric over time shortcut if user dropped dropped on it meanwhile loading', () => {
                actionStore.setState(actionStore.getState().setIn(SHORTCUT_DROPPED_ITEM, testItem));

                return dispatch(creator()).then(() => {
                    expect(findActionByType(SHORTCUT_APPLY_METRIC_OVER_TIME)).to.be.ok();
                });
            });
        });
    });
});

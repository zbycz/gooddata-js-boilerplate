import { Map } from 'immutable';

import * as Actions from '../dnd_actions';
import * as ActionTypes from '../../constants/Actions';

import * as Paths from '../../constants/StatePaths';
import { bucketItem } from '../../models/bucket_item';
import { METRICS } from '../../constants/bucket';

import { createActionStore } from '../../utils/test_action_store';
import { createTestLogging } from '../../utils/test_logging';
import buildMessage from '../../utils/message_builder';

describe('DnD actions', () => {
    let findLogEntry, findAction, dispatchAction, getCurrentState, setCurrentState;

    const dependencies = {
        execute: () => ({ type: 'REPORT_EXECUTION' })
    };

    function createCatalogueItem(id, type = 'fact') {
        let state = getCurrentState();
        const item = Map({ id, type, identifier: id });

        state = state
            .setIn(Paths.CATALOGUE_ITEMS, state.getIn(Paths.CATALOGUE_ITEMS).push(item))
            .setIn([...Paths.ITEM_CACHE, id], item);

        setCurrentState(state);
        return item;
    }

    function bucketsAddItem(keyName, id, type) {
        let state = getCurrentState();
        let item = bucketItem({ attribute: id }),
            kp = [...Paths.BUCKETS, keyName, 'items'];

        createCatalogueItem(id, type);
        state = state.setIn(kp, state.getIn(kp).push(item));

        setCurrentState(state);
        return item;
    }

    beforeEach(() => {
        const { log, formatter, findLogEntryByMessage } = createTestLogging();

        dependencies.log = log;
        dependencies.formatter = formatter;
        findLogEntry = findLogEntryByMessage;

        const { dispatch, getState, setState, findActionByType } = createActionStore();
        dispatchAction = dispatch;
        getCurrentState = getState;
        setCurrentState = setState;
        findAction = findActionByType;
    });


    describe('dropCatalogItem', () => {
        const creator = Actions.dropCatalogItem;

        let catalogueItem;

        beforeEach(() => {
            catalogueItem = createCatalogueItem('sample_catalogue_item');
        });

        it('should log action', () => {
            const payload = { keyName: METRICS, catalogueItem };

            dispatchAction(creator(payload, dependencies));

            expect(
                findLogEntry(ActionTypes.BUCKETS_DND_ITEM_INSERT)
            ).to.be.ok();
        });

        it('should execute report', () => {
            const payload = { keyName: METRICS, catalogueItem };

            dispatchAction(creator(payload, dependencies));

            const loggedReport = findAction('REPORT_EXECUTION');

            expect(loggedReport).to.be.ok();
        });
    });

    describe('removeBucketItem', () => {
        const creator = Actions.removeBucketItem;

        let item;

        beforeEach(() => {
            item = bucketsAddItem(METRICS, 'sample_catalogue_item');
        });

        it('should dispatch action', () => {
            const payload = { bucketItem: item };

            dispatchAction(creator(payload, dependencies));

            expect(
                findLogEntry(ActionTypes.BUCKETS_DND_ITEM_REMOVE)
            ).to.be.ok();
        });

        it('should execute report', () => {
            const payload = { bucketItem: item };

            dispatchAction(creator(payload, dependencies));

            const loggedReport = findAction('REPORT_EXECUTION');

            expect(loggedReport).to.be.ok();
        });
    });

    describe('replaceBucketItem', () => {
        const creator = Actions.replaceBucketItem;

        let item, catalogueItem;

        beforeEach(() => {
            item = bucketsAddItem(METRICS, 'sample_catalogue_item');
            catalogueItem = createCatalogueItem('sample_catalogue_item');
        });

        it('should dispatch action', () => {
            let payload = { bucketItem: item, catalogueItem };

            dispatchAction(creator(payload, dependencies));

            expect(
                findLogEntry(ActionTypes.BUCKETS_DND_ITEM_REPLACE)
            ).to.be.ok();
        });

        it('should execute report', () => {
            let payload = { bucketItem: item, catalogueItem };

            dispatchAction(creator(payload, dependencies));

            let loggedReport = findAction('REPORT_EXECUTION');

            expect(loggedReport).to.be.ok();
        });
    });

    describe('#startDragCatalogueItem', () => {
        const creator = Actions.startDragCatalogueItem;

        it('should create action', () => {
            const testPayload = { test: 'foo ' };
            const action = creator(testPayload);
            const { type, payload } = action;

            expect(type).to.eql('DND_ITEM_DRAG_BEGIN');
            expect(payload).to.eql({ item: testPayload });
        });
    });

    describe('#dragItemFailed', () => {
        const creator = Actions.dragItemFailed;

        it('should log action', () => {
            dispatchAction(
                creator({
                    mouseX: 1,
                    mouseY: 2,
                    from: 'bucket',
                    dragged: 'banana'
                }, dependencies)
            );

            expect(
                findLogEntry(ActionTypes.DND_ITEM_DRAG_FAILED)
            ).to.be.ok();
        });
    });

    describe('#createReportedAction', () => {
        const MY_ACTION_TYPE = 'MY_ACTION_TYPE';
        const payload = { myPayload: true };
        const state = { myState: true };
        let action, dispatch, execute, shouldExecuteReport, getState;

        beforeEach(() => {
            action = Actions.createReportedAction(MY_ACTION_TYPE);

            dispatch = sinon.stub();

            execute = sinon.stub();
            execute.returns(true);

            shouldExecuteReport = sinon.stub();

            getState = sinon.stub();
            getState.returns(state);
        });

        it('should create thunk', () => {
            expect(typeof action({})()).to.eql('function');
        });

        describe('thunk', () => {
            it('should dispatch action with payload', () => {
                action({ execute })(payload)(dispatch, getState);
                expect(dispatch).to.have.been.calledWith(buildMessage(MY_ACTION_TYPE)(payload));
            });

            it('should dispatch execute if shouldExecuteReport is not defined', () => {
                action({ execute })(payload)(dispatch, getState);
                expect(dispatch).to.have.been.calledWith(true);
            });

            describe('with shouldExecuteReport defined', () => {
                let thunk;

                beforeEach(() => {
                    thunk = action({ execute, shouldExecuteReport })(payload);
                });

                it('should dispatch execute if shouldExecuteReport returns true', () => {
                    shouldExecuteReport.returns(true);

                    thunk(dispatch, getState);
                    expect(dispatch).to.have.been.calledWith(true);
                });

                it('should not dispatch execute if shouldExecuteReport returns false', () => {
                    shouldExecuteReport.returns(false);

                    thunk(dispatch, getState);
                    expect(dispatch).not.to.have.been.calledWith(true);
                });

                it('should call shouldExecuteReport with state', () => {
                    thunk(dispatch, getState);
                    expect(shouldExecuteReport).to.have.been.calledWith(state);
                });
            });
        });
    });
});

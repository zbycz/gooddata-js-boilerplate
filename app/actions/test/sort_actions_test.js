import { fromJS } from 'immutable';
import { createActionStore } from '../../utils/test_action_store';
import { SORT_TABLE_CHANGE } from '../../constants/Actions';
import { SORT_DIR_ASC } from '../../constants/sort_directions';
import { METRICS } from '../../constants/bucket';
import * as Actions from '../sort_actions'; // eslint-disable-line
import { __RewireAPI__ as RewireAPI } from '../sort_actions'; // eslint-disable-line

describe('Sort actions', () => {
    const column = { test: 'column' };
    let index = 0, dir = SORT_DIR_ASC;
    let dispatch, getActionLog, logAction, executeReport;

    beforeEach(() => {
        const actionStore = createActionStore();

        dispatch = actionStore.dispatch;
        getActionLog = actionStore.getActionLog;
    });

    describe('#applySortTableChange', () => {
        const creator = Actions.applySortTableChange;

        beforeEach(() => {
            logAction = sinon.spy();
            executeReport = sinon.stub().returns(() => {});
            RewireAPI.__Rewire__('logAction', logAction);
            RewireAPI.__Rewire__('executeReport', executeReport);

            dispatch(creator(column, index, dir));
        });

        afterEach(() => {
            RewireAPI.__ResetDependency__('logAction');
            RewireAPI.__ResetDependency__('executeReport');
        });

        it('should dispatch sort change action', () => {
            const actionLog = getActionLog();
            expect(actionLog[0].type).to.eql(SORT_TABLE_CHANGE);
            expect(actionLog[0].payload).to.eql({ index, dir, column });
        });

        it('should log sort info', () => {
            expect(logAction).to.be.called();
        });

        it('should execute report', () => {
            expect(executeReport).to.be.called();
        });
    });

    describe('#logAction', () => {
        const projectId = 'project_id';
        let getProjectId, getItem, getItemBucket, log;

        beforeEach(() => {
            index = 2;
            logAction = RewireAPI.__get__('logAction');
            const item = fromJS({ sort: 'asc' });

            getProjectId = sinon.stub().returns(projectId);
            getItem = sinon.stub().returns(item);
            getItemBucket = sinon.stub().returns(METRICS);
            log = sinon.spy();

            RewireAPI.__Rewire__('getProjectId', getProjectId);
            RewireAPI.__Rewire__('getItem', getItem);
            RewireAPI.__Rewire__('getItemBucket', getItemBucket);
            RewireAPI.__Rewire__('log', log);

            logAction({}, index);
        });

        afterEach(() => {
            RewireAPI.__ResetDependency__('getProjectId');
            RewireAPI.__ResetDependency__('getItem');
            RewireAPI.__ResetDependency__('getItemBucket');
            RewireAPI.__ResetDependency__('log');
        });

        it('should log action', () => {
            const params = {
                column_type: 'measure',
                direction: 'asc',
                columns: index
            };

            expect(log).to.be.called();

            const args = log.args[0];

            expect(args[0]).to.eql(projectId);
            expect(args[1]).to.eql('adi-column-sorted');
            expect(args[2]).to.eql(params);
        });
    });
});

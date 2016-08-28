import { identity, noop } from 'lodash';
import { logger } from '../log_decorator';
import initialState from '../../reducers/initial_state';

function thunkedIdentity(...props) {
    return dispatch => {
        dispatch(...props);
    };
}

describe('logDecorator', () => {
    describe('generic', () => {
        let actionLog, messageLog, state;

        function dispatch(action) {
            actionLog.push(action);
        }

        function getState() {
            return state;
        }

        function logMessage(projectId, message, params) {
            messageLog.push({ projectId, message, params });
        }

        function dispatchAction(action) {
            action(dispatch, getState);
        }

        const log = (formatter, actionCreator) => logger({ log: logMessage, formatter }, actionCreator);
        const simpleFormatter = action => ({ message: action.type, params: action.payload });

        beforeEach(() => {
            actionLog = [];
            messageLog = [];
            state = initialState;
        });

        it('should dispatch sync action', () => {
            const actionCreator = log(noop, identity);
            dispatchAction(actionCreator({ type: 'simple_action' }));

            expect(actionLog[0].type).to.equal('simple_action');
        });

        it('should not log anything with empty message from formatter', () => {
            const actionCreator = log(noop, noop);
            dispatchAction(actionCreator({ type: 'simple_action' }));

            expect(messageLog.length).to.equal(0);
        });

        it('should dispatch async action', () => {
            const actionCreator = log(noop, thunkedIdentity);
            dispatchAction(actionCreator({ type: 'simple_action' }));

            expect(actionLog[0].type).to.equal('simple_action');
        });

        it('should dispatch statefull async action', () => {
            const asyncCreator = payload => (d, gs) => {
                d({ ...payload, payload: gs() });
            };
            const actionCreator = log(noop, asyncCreator);

            dispatchAction(actionCreator({ type: 'statefull_action' }));

            expect(actionLog[0].type).to.equal('statefull_action');
            expect(actionLog[0].payload).to.equal(state);
        });

        it('should log sync action', () => {
            const actionCreator = log(simpleFormatter, identity);

            dispatchAction(actionCreator({ type: 'simple_action' }));

            expect(messageLog[0].message).to.equal('simple_action');
        });

        it('should log async action', () => {
            const actionCreator = log(simpleFormatter, thunkedIdentity);

            dispatchAction(actionCreator({ type: 'simple_async_action' }));

            expect(messageLog[0].message).to.equal('simple_async_action');
        });

        it('should log statefull action', () => {
            const asyncCreator = payload => d => {
                d({ ...payload, payload: 1 });
            };
            const formatter = (a, gs) => ({ message: a.type, params: gs() });
            const actionCreator = log(formatter, asyncCreator);

            dispatchAction(actionCreator({ type: 'statefull_async_action' }));

            expect(messageLog[0].message).to.equal('statefull_async_action');
            expect(messageLog[0].params).to.equal(state);
        });
    });
});

import * as Actions from '../time_travel_actions';

import initialState from '../../reducers/initial_state';


describe('Time travel actions', () => {
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

    const simpleFormatter = action => ({ message: action.type, params: action.payload });

    beforeEach(() => {
        state = initialState;
        messageLog = [];
        actionLog = [];
    });

    const dependecies = {
        log: logMessage,
        formatter: simpleFormatter,
        updateCatalogue: () => ({ type: 'IDENTITY' })
    };

    describe('#undo', () => {
        const creator = Actions.undo;

        it('should log action', () => {
            dispatchAction(
                creator(dependecies)
            );

            const { message, params } = messageLog[0];

            expect(message).to.equal(actionLog[0].type);
            expect(params).to.equal(actionLog[0].payload);
        });

        it('should update catalogue', () => {
            dispatchAction(
                creator(dependecies)
            );

            const { type } = actionLog[1];
            expect(type).to.equal('IDENTITY');
        });
    });

    describe('#redo', () => {
        const creator = Actions.redo;

        it('should log action', () => {
            dispatchAction(
                creator(dependecies)
            );

            const { message, params } = messageLog[0];

            expect(message).to.equal(actionLog[0].type);
            expect(params).to.equal(actionLog[0].payload);
        });

        it('should update catalogue', () => {
            dispatchAction(
                creator(dependecies)
            );

            const { type } = actionLog[1];
            expect(type).to.equal('IDENTITY');
        });
    });
});

import { fromJS } from 'immutable';
import { combine, compose } from '../reducers';

describe('reducers', () => {
    let state, transientState = [];

    function firstReducer(reducedState) {
        transientState.push(reducedState);
        return reducedState.set('counter', reducedState.get('counter') + 1);
    }

    describe('compose', () => {
        beforeEach(() => {
            state = fromJS({
                counter: 0
            });
        });

        it('executes all reducers on state', () => {
            state = compose([firstReducer, firstReducer])(state);
            expect(state.get('counter')).to.equal(2);
        });

        it('executes each reducer with transient state and action', () => {
            let action = { type: 'MY_ACTION' },
                firstSpy = sinon.spy(firstReducer);

            state = compose([firstSpy, firstSpy])(state, action);

            expect(firstSpy).to.be.calledTwice();
            expect(firstSpy).to.be.calledWith(transientState[0], action);
            expect(firstSpy).to.be.calledWith(transientState[1], action);
        });
    });

    describe('combine', () => {
        let transientTodoState = [];

        function secondReducer(reducedState) {
            transientTodoState.push(reducedState);
            return reducedState.push(fromJS({ message: 'my todo' }));
        }

        beforeEach(() => {
            state = fromJS({
                operations: {
                    counter: 0
                },
                todos: []
            });
        });

        it('executes all reducers on state', () => {
            state = combine({ operations: firstReducer, todos: secondReducer })(state);
            expect(state.getIn(['operations', 'counter'])).to.equal(1);
            expect(state.get('todos').toJS()).to.eql([{ message: 'my todo' }]);
        });

        it('executes each reducer with transient substate and action', () => {
            let action = { type: 'MY_ACTION' },
                firstSpy = sinon.spy(firstReducer),
                secondSpy = sinon.spy(secondReducer);

            state = combine({ operations: firstSpy, todos: secondSpy })(state, action);

            expect(firstSpy).to.be.calledOnce();
            expect(firstSpy).to.be.calledWith(transientState[0], action);
            expect(transientState[0].toJS()).to.eql({ counter: 0 });

            expect(secondSpy).to.be.calledOnce();
            expect(secondSpy).to.be.calledWith(transientTodoState[0], action);
            expect(transientTodoState[0].toJS()).to.eql([]);
        });
    });
});

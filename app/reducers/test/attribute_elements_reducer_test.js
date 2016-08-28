import { fromJS } from 'immutable';
import { expectEqual } from '../../utils/immutable';
import { INITIAL_MODEL } from '../../models/attribute_element';
import * as Actions from '../../constants/Actions';
import reducer from '../attribute_elements_reducer';
import * as StatePaths from '../../constants/StatePaths';

describe('Attribute Elements Reducer', () => {
    describe(`${Actions.ATTRIBUTE_ELEMENTS_UPDATE}`, () => {
        it('should set loading and setup query', () => {
            const state = fromJS({
                data: {
                    attributeElements: INITIAL_MODEL
                }
            });
            const action = {
                type: Actions.ATTRIBUTE_ELEMENTS_UPDATE,
                payload: {
                    attribute: 'foo',
                    filter: '',
                    start: 0
                }
            };
            const newState = reducer(state, action);

            const expectedState = fromJS({
                data: {
                    attributeElements: {
                        query: {
                            attribute: 'foo',
                            filter: ''
                        },
                        isLoading: true,
                        items: {},
                        initialItems: null,
                        total: 0,
                        filteredTotal: 0
                    }
                }
            });

            expectEqual(newState, expectedState);
        });
    });

    describe(`${Actions.ATTRIBUTE_ELEMENTS_UPDATED}`, () => {
        const createItem = (id, uri) => ({ id, uri });

        const state = fromJS({
            data: {
                attributeElements: {
                    query: {
                        attribute: 'foo',
                        filter: 'bar'
                    },
                    items: [],
                    total: 666,
                    isLoading: true
                }
            }
        });

        const createAction = (attribute, filter) => ({
            type: Actions.ATTRIBUTE_ELEMENTS_UPDATED,
            payload: {
                attribute,
                filter,
                start: 0,
                end: 520,
                total: 2,
                items: [createItem(1, 'abc'), createItem(2, 'def')]
            }
        });

        it('should ignore action if query is not set in state', () => {
            const action = createAction('john', 'doe');
            const newState = reducer(state, action);

            expectEqual(newState, state);
        });

        it('should keep total count if attribute is not changed', () => {
            const action = createAction('foo', 'bar');
            const newState = reducer(state, action);

            expect(newState.getIn(StatePaths.ATTRIBUTE_ELEMENTS_TOTAL)).to.equal(state.getIn(StatePaths.ATTRIBUTE_ELEMENTS_TOTAL));
        });

        it('should change total count if attribute is changed', () => {
            const updateAction = {
                type: Actions.ATTRIBUTE_ELEMENTS_UPDATE,
                payload: {
                    attribute: 'john',
                    filter: 'doe',
                    start: 0
                }
            };
            const newState = reducer(state, updateAction);

            const updatedAction = createAction('john', 'doe');
            const finalState = reducer(newState, updatedAction);

            const expectedTotal = updatedAction.payload.total;
            expect(finalState.getIn(StatePaths.ATTRIBUTE_ELEMENTS_TOTAL)).to.equal(expectedTotal);
        });
    });
});

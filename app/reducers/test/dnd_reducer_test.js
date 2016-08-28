import { fromJS } from 'immutable';
import dndReducer from '../dnd_reducer';
// import initialState from '../initial_state';
import * as Actions from '../../constants/Actions';
import * as Paths from '../../constants/StatePaths';
import { METRICS, CATEGORIES } from '../../constants/bucket';

describe('dnd reducer', () => {
    let state;

    function reduce(type, payload) {
        state = dndReducer(state, { type, payload });
    }

    describe('setActiveDndItem', () => {
        beforeEach(() => {
            state = fromJS({
                data: {
                    visualizationType: 'bar',
                    buckets: {
                        [METRICS]: {
                            keyName: METRICS,
                            items: [{
                                collapsed: true,
                                filters: []
                            }, {
                                collapsed: true
                            }]
                        },
                        [CATEGORIES]: {
                            keyName: CATEGORIES,
                            items: []
                        }
                    }
                },
                appState: {
                    drag: {
                        activeItem: 'test'
                    }
                }
            });
        });

        it('should set active DnD item', () => {
            const payload = 'fooo';

            reduce(Actions.DND_ITEM_DRAG_BEGIN, { item: payload });
            expect(state.getIn(Paths.ACTIVE_DRAG_ITEM)).to.eql(payload);
        });

        it('should set active DnD item even if path is missing in store', () => {
            const payload = 'fooo';
            state = state.delete('appState');

            reduce(Actions.DND_ITEM_DRAG_BEGIN, { item: payload });
            expect(state.getIn(Paths.ACTIVE_DRAG_ITEM)).to.eql(payload);
        });
    });

    describe('clearActiveDndItem', () => {
        beforeEach(() => {
            state = fromJS({
                data: {
                    visualizationType: 'bar',
                    buckets: {
                        [METRICS]: {
                            keyName: METRICS,
                            items: []
                        },
                        [CATEGORIES]: {
                            keyName: CATEGORIES,
                            items: []
                        }
                    }
                },
                appState: {
                    drag: {
                        activeItem: 'test'
                    }
                }
            });
        });

        it('should clear active DnD item', () => {
            reduce(Actions.DND_ITEM_DRAG_END);
            expect(state.getIn(Paths.ACTIVE_DRAG_ITEM)).to.eql(undefined);
        });

        it('should recreate "empty" active DnD item if it is missing', () => {
            state = state.delete('appState');

            reduce(Actions.DND_ITEM_DRAG_END);
            expect(state.getIn(Paths.ACTIVE_DRAG_ITEM)).to.eql(undefined);
        });
    });
});

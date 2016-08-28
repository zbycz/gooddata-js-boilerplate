import { setCurrentState } from '../CustomDragLayer';

describe('CustomDragLayer', () => {
    describe('#setCurrentState', () => {
        let state;

        beforeEach(() => {
            state = { item: null, initialOffset: null, currentOffset: null };
        });

        function setState(newState) {
            state = { ...state, ...newState };
        }

        const item = { dragged: 'N/A', from: 'N/A' };
        const offset = { x: 0, y: 0 };

        it('should set item and initialOffset on startDrag', () => {
            const newProps = { item, currentOffset: offset, isDragging: true };

            setCurrentState(newProps, state, setState);

            expect(state.item).to.equal(newProps.item);
            expect(state.initialOffset).to.equal(newProps.currentOffset);
        });

        it('should set currentOffset on drag', () => {
            const newProps = { item, currentOffset: offset, isDragging: true };

            setCurrentState(newProps, state, setState);

            expect(state.currentOffset).to.equal(newProps.currentOffset);
        });

        it('should remove item and initialOffset on drop', () => {
            const newProps = { item, currentOffset: null, isDragging: true };

            setCurrentState(newProps, state, setState);

            expect(state.item).to.equal(null);
            expect(state.initialOffset).to.equal(null);
        });

        it('should keep item and initialOffset on drag end', () => {
            const newProps = { item: null, currentOffset: null, isDragging: false };

            state = { item, initialOffset: offset, currentOffset: offset };

            setCurrentState(newProps, state, setState);

            expect(state.item).to.equal(item);
            expect(state.initialOffset).to.equal(offset);
        });
    });
});

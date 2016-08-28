import {
     isReportEmptySelector,
     displayAttributeSelector,
     displayMetricSelector,
     displayBlockSelector,
     displayMetricOverTimeSelector
} from '../shortcuts_selector';
import * as StatePaths from '../../constants/StatePaths';
import initialState from '../../reducers/initial_state';
import { CATEGORIES, METRICS, STACKS } from '../../constants/bucket';
import { ATTRIBUTE, METRIC, FACT, DATE } from '../../constants/CatalogueItemTypes';
import { bucketItem } from '../../models/bucket_item';

describe('Shortcuts selector', () => {
    describe('isReportEmptySelector', () => {
        it('should return true by default', () => {
            expect(isReportEmptySelector(initialState)).to.eql(true);
        });

        it('should return false if there is an Item in Metrics bucket', () => {
            const state = initialState
                .setIn([...StatePaths.BUCKETS, METRICS, 'items'], bucketItem({}));

            expect(isReportEmptySelector(state)).to.eql(false);
        });

        it('should return false if there is an Item in Categories bucket', () => {
            const state = initialState
                .setIn([...StatePaths.BUCKETS, CATEGORIES, 'items'], bucketItem({}));

            expect(isReportEmptySelector(state)).to.eql(false);
        });

        it('should return false if there is an Item in Stacks bucket', () => {
            const state = initialState
                .setIn([...StatePaths.BUCKETS, STACKS, 'items'], bucketItem({}));

            expect(isReportEmptySelector(state)).to.eql(false);
        });
    });

    describe('activeDragItemSelector', () => {
        it('should be false if dragItem is not set', () => {
            expect(displayAttributeSelector(initialState)).to.eql(false);
        });

        it('should be true if dragItem is set', () => {
            const state = initialState
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({ type: ATTRIBUTE }));
            expect(displayAttributeSelector(state)).to.eql(true);
        });
    });

    describe('displayAttributeSelector', () => {
        it('should be false if report and dragItem are empty', () => {
            expect(displayAttributeSelector(initialState)).to.eql(false);
        });

        it('should be false if report is not empty', () => {
            const state = initialState
                .setIn([...StatePaths.BUCKETS, METRICS, 'items'], bucketItem({}))
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({}));
            expect(displayAttributeSelector(state)).to.eql(false);
        });

        it('should be true if report is empty and activeDragItem is set to attribute', () => {
            const state = initialState
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({ type: ATTRIBUTE }));
            expect(displayAttributeSelector(state)).to.eql(true);
        });

        it('should be true if report is empty and activeDragItem is set to date', () => {
            const state = initialState
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({ type: DATE }));
            expect(displayAttributeSelector(state)).to.eql(true);
        });

        it('should be false if report is empty and activeDragItem is set to metric', () => {
            const state = initialState
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({ type: METRIC }));
            expect(displayAttributeSelector(state)).to.eql(false);
        });

        it('should be false if report is empty and activeDragItem is set to fact', () => {
            const state = initialState
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({ type: FACT }));
            expect(displayAttributeSelector(state)).to.eql(false);
        });
    });

    describe('displayMetricSelector', () => {
        it('should be false if report and dragItem are empty', () => {
            expect(displayMetricSelector(initialState)).to.eql(false);
        });

        it('should be false if report is not empty', () => {
            const state = initialState
                .setIn([...StatePaths.BUCKETS, METRICS, 'items'], bucketItem({}))
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({}));
            expect(displayMetricSelector(state)).to.eql(false);
        });

        it('should be false if report is empty and activeDragItem is set to attribute', () => {
            const state = initialState
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({ type: ATTRIBUTE }));
            expect(displayMetricSelector(state)).to.eql(false);
        });

        it('should be true if report is empty and activeDragItem is set to metric', () => {
            const state = initialState
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({ type: METRIC }));
            expect(displayMetricSelector(state)).to.eql(true);
        });

        it('should be true if report is empty and activeDragItem is set to fact', () => {
            const state = initialState
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({ type: FACT }));
            expect(displayMetricSelector(state)).to.eql(true);
        });
    });

    describe('displayBlockSelector', () => {
        it('should be false by default', () => {
            expect(displayBlockSelector(initialState)).to.eql(false);
        });

        it('should be true if report is empty and activeDragItem is set to attribute', () => {
            const state = initialState
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({ type: ATTRIBUTE }));
            expect(displayBlockSelector(state)).to.eql(true);
        });

        it('should be true if report is empty and activeDragItem is set to metric', () => {
            const state = initialState
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({ type: METRIC }));
            expect(displayBlockSelector(state)).to.eql(true);
        });

        it('should be true if report is empty and activeDragItem is set to fact', () => {
            const state = initialState
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({ type: FACT }));
            expect(displayBlockSelector(state)).to.eql(true);
        });
    });

    describe('displayMetricOverTimeSelector', () => {
        it('should be false by default', () => {
            expect(displayMetricOverTimeSelector(initialState)).to.eql(false);
        });
    });

    describe('displayMetricOverTimeSelector', () => {
        it('should be true if report is empty, date datasets are available & dragging item is metric', () => {
            const state = initialState
                .setIn([...StatePaths.ACTIVE_DRAG_ITEM], bucketItem({ type: METRIC }))
                .updateIn(StatePaths.DATE_DATASETS_AVAILABLE, list => list.push({ foo: 'bar' }));
            expect(displayMetricOverTimeSelector(state)).to.eql(true);
        });
    });
});

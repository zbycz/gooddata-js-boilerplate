import * as StatePaths from '../../constants/StatePaths';
import exportButtonSelector from '../export_button_selector';
import { bucketItem } from '../../models/bucket_item';
import { metricAttributeFilter } from '../../models/metric_attribute_filter';
import initialState from '../../reducers/initial_state';
import * as BucketTypes from '../../constants/bucket';
import { Map } from 'immutable';

describe('exportButtonSelector', () => {
    let state;

    beforeEach(() => {
        state = initialState;
    });

    function cacheBucketItem(id) {
        const item = Map({
            id,
            type: 'attribute',
            identifier: id,
            title: id
        });
        state = state.setIn([...StatePaths.ITEM_CACHE, id], item);
        return item;
    }

    function bucketsAddItem(keyName, bucketItemParams) {
        const item = bucketItem(bucketItemParams);
        cacheBucketItem(bucketItemParams.attribute);
        state = state.updateIn([...StatePaths.BUCKETS, keyName, 'items'], items => items.push(item));
        return item;
    }

    describe('duplicatedObject', () => {
        it('should not be set when stack and metric buckets contain different items', () => {
            bucketsAddItem(BucketTypes.METRICS, {
                attribute: 'sample.attribute.foo'
            });
            bucketsAddItem(BucketTypes.STACKS, {
                attribute: 'sample.attribute.bar'
            });

            const { duplicatedObject } = exportButtonSelector(state);
            expect(duplicatedObject).to.equal(null);
        });

        it('should be set when metric bucket contains the same item', () => {
            bucketsAddItem(BucketTypes.METRICS, {
                attribute: 'sample.attribute.foo'
            });
            bucketsAddItem(BucketTypes.METRICS, {
                attribute: 'sample.attribute.foo'
            });

            const { duplicatedObject } = exportButtonSelector(state);
            expect(duplicatedObject).to.be.ok();
        });

        it('should not be set when metric bucket contains the same item with different aggregation', () => {
            bucketsAddItem(BucketTypes.METRICS, {
                attribute: 'sample.attribute.foo',
                aggregation: 'COUNT'
            });
            bucketsAddItem(BucketTypes.METRICS, {
                attribute: 'sample.attribute.foo',
                aggregation: 'SUM'
            });

            const { duplicatedObject } = exportButtonSelector(state);
            expect(duplicatedObject).to.equal(null);
        });

        it('should be set when categories and stacks contain the same item', () => {
            bucketsAddItem(BucketTypes.CATEGORIES, {
                attribute: 'sample.attribute.foo'
            });
            bucketsAddItem(BucketTypes.STACKS, {
                attribute: 'sample.attribute.foo'
            });

            const { duplicatedObject } = exportButtonSelector(state);
            expect(duplicatedObject).to.be.ok();
        });

        it('should contain title and type', () => {
            bucketsAddItem(BucketTypes.METRICS, {
                attribute: 'sample.attribute.foo'
            });
            bucketsAddItem(BucketTypes.METRICS, {
                attribute: 'sample.attribute.foo'
            });

            const { duplicatedObject } = exportButtonSelector(state);

            expect(duplicatedObject.get('type')).to.equal('attribute');
            expect(duplicatedObject.get('title')).to.equal('sample.attribute.foo');
        });
    });

    describe('isExportDisabled', () => {
        it('should be true when all buckets are empty', () => {
            const { isExportDisabled } = exportButtonSelector(initialState);
            expect(isExportDisabled).to.equal(true);
        });

        it('should be true if buckets contain same item', () => {
            bucketsAddItem(BucketTypes.CATEGORIES, {
                attribute: 'sample.attribute.foo'
            });
            bucketsAddItem(BucketTypes.STACKS, {
                attribute: 'sample.attribute.foo'
            });

            const { isExportDisabled } = exportButtonSelector(state);
            expect(isExportDisabled).to.equal(true);
        });

        it('should depends only on basic metric properties', () => {
            const createFilter = (props = {}) => metricAttributeFilter(props);
            bucketsAddItem(BucketTypes.METRICS, {
                attribute: 'sample.attribute.bar',
                filters: [createFilter({ attribute: 'foo' })],
                collapsed: true
            });

            bucketsAddItem(BucketTypes.METRICS, {
                attribute: 'sample.attribute.bar',
                filters: [createFilter()],
                collapsed: true
            });

            const { isExportDisabled } = exportButtonSelector(state);
            expect(isExportDisabled).to.equal(false);
        });
    });
});

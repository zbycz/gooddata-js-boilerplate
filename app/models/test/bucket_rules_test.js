import { fromJS } from 'immutable';

import { isAllowedToAdd, isAllowedToReplace, isAllowedToChangeDateFilterDimension,
    displayRecommendationContributionInPercents, displayRecommendationMetricWithPeriod,
    displayRecommendationComparisonWithPeriod, displayRecommendationsTrending,
    displayRecommendationComparison } from '../bucket_rules';

import * as ItemTypes from '../../constants/DragItemTypes';
import { METRICS, CATEGORIES, FILTERS, STACKS } from '../../constants/bucket';
import { ALL_TIME } from '../../constants/presets';

import { DATE_DATASET_ATTRIBUTE } from '../date_item';
import * as dateDataSetModel from '../date_dataset';
import { INITIAL_MODEL } from '../bucket';
import {
    VISUALIZATION_TYPE_TABLE,
    VISUALIZATION_TYPE_COLUMN,
    VISUALIZATION_TYPE_BAR,
    VISUALIZATION_TYPE_LINE } from '../visualization_type';

describe('Bucket Rules', () => {
    let buckets;

    beforeEach(() => {
        buckets = INITIAL_MODEL;
    });

    describe('#isAllowedToAdd', () => {
        it('should accept an attribute in metrics', () => {
            const item = fromJS({ type: 'attribute' });

            const isAllowed = isAllowedToAdd('column', buckets, { item, to: METRICS });

            expect(isAllowed).to.equal(true);
        });

        it('should accept a date in categories', () => {
            const item = fromJS({ identifier: DATE_DATASET_ATTRIBUTE, type: 'date' });

            const isAllowed = isAllowedToAdd('column', buckets, { item, to: CATEGORIES });

            expect(isAllowed).to.equal(true);
        });

        it('should not accept a fact in categories', () => {
            const item = fromJS({ type: 'fact' });

            const isAllowed = isAllowedToAdd('column', buckets, { item, to: CATEGORIES });

            expect(isAllowed).to.equal(false);
        });

        it('should not accept second attribute in stacks', () => {
            buckets = buckets.mergeIn([STACKS], fromJS({
                items: [{ attribute: 'some_item' }]
            }));

            const item = fromJS({
                identifier: 'some_other_item',
                type: 'attribute'
            });
            const isAllowed = isAllowedToAdd('column', buckets, { item, to: STACKS });

            expect(isAllowed).to.equal(false);
        });

        it('should accept different attribute in filters', () => {
            buckets = buckets.mergeIn([FILTERS], fromJS({
                items: [{ attribute: DATE_DATASET_ATTRIBUTE }]
            }));
            const item = fromJS({
                identifier: 'some_other_item',
                type: 'attribute'
            });
            const isAllowed = isAllowedToAdd('column', buckets, { item, to: FILTERS });

            expect(isAllowed).to.equal(true);
        });

        it('should accept the same attribute in metrics', () => {
            const CATALOGUE_ITEM_ID = 'catalogue_item';
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [{ attribute: CATALOGUE_ITEM_ID }]
            }));
            const item = fromJS({
                identifier: CATALOGUE_ITEM_ID,
                type: 'attribute'
            });

            const isAllowed = isAllowedToAdd('column', buckets, { item, to: METRICS });

            expect(isAllowed).to.equal(true);
        });

        it('should not accept the same attribute in categories', () => {
            const CATALOGUE_ITEM_ID = 'catalogue_item';
            buckets = buckets.mergeIn([CATEGORIES], fromJS({
                items: [{ attribute: CATALOGUE_ITEM_ID }]
            }));
            const item = fromJS({
                identifier: CATALOGUE_ITEM_ID,
                type: 'attribute'
            });

            const isAllowed = isAllowedToAdd('table', buckets, { item, to: CATEGORIES });

            expect(isAllowed).to.equal(false);
        });

        it('should not accept the same item [date]', () => {
            buckets = buckets.mergeIn([CATEGORIES], fromJS({
                items: [{ attribute: DATE_DATASET_ATTRIBUTE }]
            }));
            const item = fromJS({
                identifier: DATE_DATASET_ATTRIBUTE,
                type: 'date'
            });

            const isAllowed = isAllowedToAdd('table', buckets, { item, to: CATEGORIES });

            expect(isAllowed).to.equal(false);
        });

        it('should not allow drop of bucket item into metrics', () => {
            const item = fromJS({
                identifier: 'sample',
                type: 'attribute'
            });

            const isAllowed = isAllowedToAdd('column', buckets, {
                type: ItemTypes.BUCKET_ITEM,
                item,
                to: METRICS
            });

            expect(isAllowed).to.equal(false);
        });

        it('should allow drop of stacks bucket item into categories', () => {
            const item = fromJS({
                identifier: 'sample',
                type: 'attribute'
            });

            const isAllowed = isAllowedToAdd('column', buckets, {
                type: ItemTypes.BUCKET_ITEM,
                to: CATEGORIES,
                from: STACKS,
                item
            });

            expect(isAllowed).to.equal(true);
        });

        it('should not allow drop of metric bucket item into categories', () => {
            const item = fromJS({
                identifier: 'sample',
                type: 'attribute'
            });

            const isAllowed = isAllowedToAdd('column', buckets, {
                type: ItemTypes.BUCKET_ITEM,
                to: CATEGORIES,
                from: METRICS,
                item
            });

            expect(isAllowed).to.equal(false);
        });

        it('should not allow swap with the same bucket', () => {
            const item = fromJS({
                identifier: 'sample',
                type: 'attribute'
            });

            const isAllowed = isAllowedToAdd('column', buckets, {
                type: ItemTypes.BUCKET_ITEM,
                to: CATEGORIES,
                from: CATEGORIES,
                item
            });

            expect(isAllowed).to.equal(false);
        });
    });

    describe('#isAllowedToReplace', () => {
        it('should accept a attribute', () => {
            const bucketItem = fromJS({ attribute: 'attr' });
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [bucketItem]
            }));

            const item = fromJS({ type: 'attribute' });
            const isAllowed = isAllowedToReplace('column', buckets, { item, bucketItem, to: METRICS });

            expect(isAllowed).to.equal(true);
        });

        it('should accept a date', () => {
            const bucketItem = fromJS({ attribute: 'attr' });
            buckets = buckets.mergeIn([CATEGORIES], fromJS({
                items: [bucketItem]
            }));

            const item = fromJS({ identifier: DATE_DATASET_ATTRIBUTE, type: 'date' });
            const isAllowed = isAllowedToReplace('column', buckets, { item, bucketItem, to: CATEGORIES });

            expect(isAllowed).to.equal(true);
        });

        it('should not accept a fact', () => {
            const bucketItem = fromJS({ attribute: 'attr' });
            buckets = buckets.mergeIn([CATEGORIES], fromJS({
                items: [bucketItem]
            }));
            const item = fromJS({ type: 'fact' });

            const isAllowed = isAllowedToReplace('column', buckets, { item, bucketItem, to: CATEGORIES });

            expect(isAllowed).to.equal(false);
        });

        it('should accept different item', () => {
            const bucketItem = fromJS({ attribute: DATE_DATASET_ATTRIBUTE });
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [bucketItem]
            }));
            const item = fromJS({
                identifier: 'some_other_item',
                type: 'attribute'
            });
            const isAllowed = isAllowedToReplace('column', buckets, { item, bucketItem, to: METRICS });

            expect(isAllowed).to.equal(true);
        });

        it('should accept different item [more items in bucket]', () => {
            const bucketItem = fromJS({ attribute: DATE_DATASET_ATTRIBUTE });
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [bucketItem, { attribute: 'some_item' }]
            }));
            const item = fromJS({
                identifier: 'some_other_item',
                type: 'attribute'
            });
            const isAllowed = isAllowedToReplace('column', buckets, { item, bucketItem, to: METRICS });

            expect(isAllowed).to.equal(true);
        });

        it('should not accept the same item in categories', () => {
            const CATALOGUE_ITEM_ID = 'catalogue_item';
            const bucketItem = fromJS({ attribute: CATALOGUE_ITEM_ID });
            buckets = buckets.mergeIn([CATEGORIES], fromJS({
                items: [bucketItem]
            }));
            const item = fromJS({
                identifier: CATALOGUE_ITEM_ID,
                type: 'attribute'
            });

            const isAllowed = isAllowedToReplace('table', buckets, { item, bucketItem, to: CATEGORIES });

            expect(isAllowed).to.equal(false);
        });

        it('should accept the same item in metrics', () => {
            const CATALOGUE_ITEM_ID = 'catalogue_item';
            const bucketItem = fromJS({ attribute: CATALOGUE_ITEM_ID });
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [bucketItem]
            }));
            const item = fromJS({
                identifier: CATALOGUE_ITEM_ID,
                type: 'attribute'
            });

            const isAllowed = isAllowedToReplace('table', buckets, { item, bucketItem, to: METRICS });

            expect(isAllowed).to.equal(true);
        });

        it('should not accept the same item [more items]', () => {
            const CATALOGUE_ITEM_ID = 'catalogue_item';
            const bucketItem = fromJS({ attribute: CATALOGUE_ITEM_ID });
            buckets = buckets.mergeIn([CATEGORIES], fromJS({
                items: [bucketItem, { attribute: 'yet_another_item' }]
            }));
            const item = fromJS({
                identifier: CATALOGUE_ITEM_ID,
                type: 'attribute'
            });

            const isAllowed = isAllowedToReplace('table', buckets, { item, bucketItem, to: CATEGORIES });

            expect(isAllowed).to.equal(false);
        });

        it('should not accept the same item [more items, categories, replace other item]', () => {
            const CATALOGUE_ITEM_ID = 'catalogue_item';
            const bucketItem = fromJS({ attribute: CATALOGUE_ITEM_ID });
            const otherItem = fromJS({ attribute: 'yet_another_item' });
            buckets = buckets.mergeIn([CATEGORIES], fromJS({
                items: [bucketItem, otherItem]
            }));
            const item = fromJS({
                identifier: CATALOGUE_ITEM_ID,
                type: 'attribute'
            });

            const isAllowed = isAllowedToReplace('table', buckets, { item, bucketItem: otherItem, to: CATEGORIES });

            expect(isAllowed).to.equal(false);
        });

        it('should not accept the same item [date]', () => {
            const bucketItem = fromJS({ attribute: DATE_DATASET_ATTRIBUTE });
            buckets = buckets.mergeIn([CATEGORIES], fromJS({
                items: [bucketItem]
            }));
            const item = fromJS({
                identifier: DATE_DATASET_ATTRIBUTE,
                type: 'date'
            });

            const isAllowed = isAllowedToReplace('table', buckets, { item, bucketItem, to: CATEGORIES });

            expect(isAllowed).to.equal(false);
        });

        it('should not accept if there is date already [date]', () => {
            const bucketItem = fromJS({ attribute: DATE_DATASET_ATTRIBUTE });
            const otherItem = fromJS({ attribute: 'yet_another_item' });
            buckets = buckets.mergeIn([CATEGORIES], fromJS({
                items: [bucketItem, otherItem]
            }));
            const item = fromJS({
                identifier: DATE_DATASET_ATTRIBUTE,
                type: 'date'
            });

            const isAllowed = isAllowedToReplace('table', buckets, { item, bucketItem: otherItem, to: CATEGORIES });

            expect(isAllowed).to.equal(false);
        });


        it('should not allow swap of bucket item into metrics', () => {
            const bucketItem = fromJS({ attribute: 'some_item' });
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [bucketItem]
            }));
            const item = fromJS({
                identifier: 'some_other_item',
                type: 'attribute'
            });

            const isAllowed = isAllowedToReplace('table', buckets, {
                type: ItemTypes.BUCKET_ITEM,
                item,
                bucketItem,
                to: METRICS,
                from: STACKS
            });

            expect(isAllowed).to.equal(false);
        });

        it('should allow swap of bucket item into categories', () => {
            const bucketItem = fromJS({ attribute: 'some_item' });
            buckets = buckets.mergeIn([CATEGORIES], fromJS({
                items: [bucketItem]
            }));
            const item = fromJS({
                identifier: 'some_other_item',
                type: 'attribute'
            });

            const isAllowed = isAllowedToReplace('table', buckets, {
                type: ItemTypes.BUCKET_ITEM,
                item,
                bucketItem,
                to: CATEGORIES,
                from: STACKS
            });

            expect(isAllowed).to.equal(true);
        });

        it('should not allow swap of bucket item from metrics', () => {
            const bucketItem = fromJS({ attribute: 'some_item' });
            buckets = buckets.mergeIn([CATEGORIES], fromJS({
                items: [bucketItem]
            }));
            const item = fromJS({
                identifier: 'some_other_item',
                type: 'attribute'
            });

            const isAllowed = isAllowedToReplace('table', buckets, {
                type: ItemTypes.BUCKET_ITEM,
                item,
                bucketItem,
                to: CATEGORIES,
                from: METRICS
            });

            expect(isAllowed).to.equal(false);
        });
    });

    describe('#isAllowedToChangeDateFilterDimension', () => {
        it('should be true when there is no date item in categories', () => {
            const isAllowed = isAllowedToChangeDateFilterDimension('column', buckets);
            expect(isAllowed).to.equal(true);
        });

        it('should be false when there is a date item in categories', () => {
            buckets = buckets.mergeIn([CATEGORIES], fromJS({
                items: [{ attribute: DATE_DATASET_ATTRIBUTE }]
            }));

            const isAllowed = isAllowedToChangeDateFilterDimension('column', buckets);
            expect(isAllowed).to.equal(false);
        });
    });

    describe('#displayRecommendationContributionInPercents', () => {
        let itemCache;

        beforeEach(() => {
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [{ showInPercent: false }]
            })).mergeIn([CATEGORIES], fromJS({
                items: [{ attribute: 'test' }]
            }));

            itemCache = fromJS({
                test: { type: 'attribute' }
            });
        });

        it('should be true when conditions are met', () => {
            const isAllowed = displayRecommendationContributionInPercents(VISUALIZATION_TYPE_COLUMN, buckets, itemCache);
            expect(isAllowed).to.equal(true);
        });

        it('should be false when visType is not column', () => {
            const isAllowed =
                displayRecommendationContributionInPercents(VISUALIZATION_TYPE_TABLE, buckets, itemCache) ||
                displayRecommendationContributionInPercents(VISUALIZATION_TYPE_BAR, buckets, itemCache) ||
                displayRecommendationContributionInPercents(VISUALIZATION_TYPE_LINE, buckets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has more than one metrics', () => {
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [{ showInPercent: false }, { showInPercent: false }, { showInPercent: false }]
            }));

            const isAllowed = displayRecommendationContributionInPercents(VISUALIZATION_TYPE_COLUMN, buckets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has stack', () => {
            buckets = buckets.mergeIn([STACKS], fromJS({
                items: [{ showInPercent: false }]
            }));

            const isAllowed = displayRecommendationContributionInPercents(VISUALIZATION_TYPE_COLUMN, buckets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket doesnt have category', () => {
            buckets = buckets.deleteIn([CATEGORIES]);

            const isAllowed = displayRecommendationContributionInPercents(VISUALIZATION_TYPE_COLUMN, buckets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has already set showInPercent flag', () => {
            buckets = buckets.setIn([METRICS, 'items', 0, 'showInPercent'], true);

            const isAllowed = displayRecommendationContributionInPercents(VISUALIZATION_TYPE_COLUMN, buckets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when ther is no attribute', () => {
            itemCache = fromJS({});

            const isAllowed = displayRecommendationContributionInPercents(VISUALIZATION_TYPE_COLUMN, buckets, itemCache);
            expect(isAllowed).to.equal(false);
        });
    });

    describe('#displayRecommendationMetricWithPeriod', () => {
        let dateDataSets;
        let itemCache;

        beforeEach(() => {
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [{ showInPercent: false, showPoP: false }]
            })).mergeIn([CATEGORIES], fromJS({
                items: [{ attribute: DATE_DATASET_ATTRIBUTE }]
            })).mergeIn([FILTERS], fromJS({
                items: [{
                    attribute: DATE_DATASET_ATTRIBUTE,
                    filters: [{ interval: { name: 'NOT_ALL_TIME' } }]
                }]
            }));

            dateDataSets = dateDataSetModel
                .INITIAL_MODEL
                .mergeIn(['available'], fromJS([{ title: 'test' }]));

            itemCache = fromJS({});
        });

        it('should be true when conditions are met', () => {
            const isAllowed = displayRecommendationMetricWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(true);
        });

        it('should be false when visType is not column', () => {
            const isAllowed =
                displayRecommendationMetricWithPeriod(VISUALIZATION_TYPE_TABLE, buckets, dateDataSets, itemCache) ||
                displayRecommendationMetricWithPeriod(VISUALIZATION_TYPE_BAR, buckets, dateDataSets, itemCache) ||
                displayRecommendationMetricWithPeriod(VISUALIZATION_TYPE_LINE, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has more than one metrics', () => {
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [{ showInPercent: false }, { showInPercent: false }, { showInPercent: false }]
            }));

            const isAllowed = displayRecommendationMetricWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has stack', () => {
            buckets = buckets.mergeIn([STACKS], fromJS({
                items: [{ showInPercent: false }]
            }));

            const isAllowed = displayRecommendationMetricWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has no used date', () => {
            buckets = buckets.deleteIn([CATEGORIES, 'items', 0, 'attribute'], fromJS({
                items: [{ showInPercent: false }]
            }));

            const isAllowed = displayRecommendationMetricWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket doesnt have category', () => {
            buckets = buckets.deleteIn([CATEGORIES]);

            const isAllowed = displayRecommendationMetricWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has already set showPoP flag', () => {
            buckets = buckets.setIn([METRICS, 'items', 0, 'showPoP'], true);

            const isAllowed = displayRecommendationMetricWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when date filter is "all time"', () => {
            buckets = buckets.setIn([FILTERS, 'items', 0, 'filters', 0, 'interval', 'name'], ALL_TIME);

            const isAllowed = displayRecommendationMetricWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });
    });

    describe('#displayRecommendationComparisonWithPeriod', () => {
        let dateDataSets;
        let itemCache;

        beforeEach(() => {
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [{ showPoP: false }]
            })).mergeIn([CATEGORIES], fromJS({
                items: [{ attribute: 'test' }]
            }));

            dateDataSets = dateDataSetModel
                .INITIAL_MODEL
                .mergeIn(['available'], fromJS([{ title: 'test' }]));

            itemCache = fromJS({
                test: { type: 'attribute' }
            });
        });

        it('should be true when conditions are met', () => {
            const isAllowed = displayRecommendationComparisonWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(true);
        });

        it('should be false when visType is not column', () => {
            const isAllowed =
                displayRecommendationComparisonWithPeriod(VISUALIZATION_TYPE_TABLE, buckets, dateDataSets, itemCache) ||
                displayRecommendationComparisonWithPeriod(VISUALIZATION_TYPE_BAR, buckets, dateDataSets, itemCache) ||
                displayRecommendationComparisonWithPeriod(VISUALIZATION_TYPE_LINE, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has more than one metrics', () => {
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [{ showPoP: false }, { showPoP: false }, { showPoP: false }]
            }));

            const isAllowed = displayRecommendationComparisonWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has stack', () => {
            buckets = buckets.mergeIn([STACKS], fromJS({
                items: [{ showPoP: false }]
            }));

            const isAllowed = displayRecommendationComparisonWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket doesnt have category', () => {
            buckets = buckets.deleteIn([CATEGORIES]);

            const isAllowed = displayRecommendationComparisonWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has no date datasets', () => {
            dateDataSets = dateDataSets.deleteIn(['available', 0]);

            const isAllowed =
                displayRecommendationComparisonWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, undefined, itemCache) ||
                displayRecommendationComparisonWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has already set showPoP flag', () => {
            buckets = buckets.setIn([METRICS, 'items', 0, 'showPoP'], true);

            const isAllowed = displayRecommendationComparisonWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when there is no attribute', () => {
            itemCache = fromJS({});

            const isAllowed = displayRecommendationComparisonWithPeriod(VISUALIZATION_TYPE_COLUMN, buckets, itemCache);
            expect(isAllowed).to.equal(false);
        });
    });

    describe('#displayRecommendationsTrending', () => {
        let dateDataSets;
        let itemCache;

        beforeEach(() => {
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [{ showPoP: false }]
            }))
            .mergeIn([CATEGORIES], fromJS({
                items: [{ attribute: 'test' }]
            }));

            itemCache = fromJS({
                test: { type: 'attribute' }
            });

            dateDataSets = dateDataSetModel
                .INITIAL_MODEL
                .mergeIn(['available'], fromJS([{ title: 'test' }]));

            itemCache = fromJS({});
        });

        it('should be true when conditions are met', () => {
            const isAllowed = displayRecommendationsTrending(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(true);
        });

        it('should be false when visType is not column', () => {
            const isAllowed =
                displayRecommendationsTrending(VISUALIZATION_TYPE_TABLE, buckets, dateDataSets, itemCache) ||
                displayRecommendationsTrending(VISUALIZATION_TYPE_BAR, buckets, dateDataSets, itemCache) ||
                displayRecommendationsTrending(VISUALIZATION_TYPE_LINE, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has more than one metrics', () => {
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [{ showPoP: false }, { showPoP: false }, { showPoP: false }]
            }));

            const isAllowed = displayRecommendationsTrending(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has no dimensions', () => {
            dateDataSets = dateDataSets.deleteIn(['available', 0]);

            const isAllowed =
                displayRecommendationsTrending(VISUALIZATION_TYPE_COLUMN, buckets, undefined, itemCache) ||
                displayRecommendationsTrending(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when there is an attribute', () => {
            itemCache = fromJS({ test: { type: 'attribute' } });

            const isAllowed = displayRecommendationsTrending(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when there is a date in categories', () => {
            buckets = buckets.setIn([CATEGORIES, 'items', 0, 'attribute'], DATE_DATASET_ATTRIBUTE);

            const isAllowed = displayRecommendationsTrending(VISUALIZATION_TYPE_COLUMN, buckets, dateDataSets, itemCache);
            expect(isAllowed).to.equal(false);
        });
    });

    describe('#displayRecommendationComparison', () => {
        let itemCache, availableAttributes;

        beforeEach(() => {
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [{ showPoP: false }]
            }))
            .mergeIn([CATEGORIES], fromJS({
                items: [{ attribute: 'test' }]
            }));

            itemCache = fromJS({
                test: { type: 'attribute' }
            });

            itemCache = fromJS({});

            availableAttributes = fromJS([{}]);
        });

        it('should be true when conditions are met', () => {
            const isAllowed = displayRecommendationComparison(VISUALIZATION_TYPE_COLUMN, buckets, itemCache, availableAttributes);
            expect(isAllowed).to.equal(true);
        });

        it('should be false when visType is not column', () => {
            const isAllowed =
                displayRecommendationComparison(VISUALIZATION_TYPE_TABLE, buckets, itemCache, availableAttributes) ||
                displayRecommendationComparison(VISUALIZATION_TYPE_BAR, buckets, itemCache, availableAttributes) ||
                displayRecommendationComparison(VISUALIZATION_TYPE_LINE, buckets, itemCache, availableAttributes);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when bucket has more than one metrics', () => {
            buckets = buckets.mergeIn([METRICS], fromJS({
                items: [{ showPoP: false }, { showPoP: false }, { showPoP: false }]
            }));

            const isAllowed = displayRecommendationComparison(VISUALIZATION_TYPE_COLUMN, buckets, itemCache, availableAttributes);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when there is an attribute', () => {
            itemCache = fromJS({ test: { type: 'attribute' } });

            const isAllowed = displayRecommendationComparison(VISUALIZATION_TYPE_COLUMN, buckets, itemCache, availableAttributes);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when there is a date in categories', () => {
            buckets = buckets.setIn([CATEGORIES, 'items', 0, 'attribute'], DATE_DATASET_ATTRIBUTE);

            const isAllowed = displayRecommendationComparison(VISUALIZATION_TYPE_COLUMN, buckets, itemCache, availableAttributes);
            expect(isAllowed).to.equal(false);
        });

        it('should be false when there are no available attributes', () => {
            const isAllowed = displayRecommendationComparison(VISUALIZATION_TYPE_COLUMN, buckets, itemCache, fromJS([]));
            expect(isAllowed).to.equal(false);
        });
    });
});

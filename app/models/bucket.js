import { Map, List, Record, fromJS } from 'immutable';

import { decoratedBucketItem } from './bucket_item';
import { bucketRules } from './bucket_rules';

import { METRICS, CATEGORIES, FILTERS, STACKS } from '../constants/bucket';

const bucketBase = {
    keyName: null,
    items: List()
};

function createBucket(props) {
    return fromJS({ ...bucketBase, ...props });
}

export const INITIAL_MODEL = fromJS({
    [METRICS]: createBucket({ keyName: METRICS }),
    [CATEGORIES]: createBucket({ keyName: CATEGORIES }),
    [FILTERS]: createBucket({ keyName: FILTERS }),
    [STACKS]: createBucket({ keyName: STACKS })
});

const DecoratedBucket = Record({
    ...bucketBase,
    original: null,
    accepts: List(),
    itemsLimit: 20,
    enabled: true,
    allowsDuplicateItems: true,
    allowsSwapping: true
});

function getItems(bucket, itemCache, dateDataSets) {
    return bucket.get('items')
        .map(item => decoratedBucketItem(item, bucket, itemCache, dateDataSets));
}

export function decoratedBucket(bucket, itemCache, dateDataSets, visualizationType) {
    return new DecoratedBucket(bucket.withMutations(mutable =>
        mutable
            .set('original', bucket)
            .set('items', getItems(mutable, itemCache, dateDataSets))
            .merge(bucketRules(visualizationType, bucket.get('keyName')))
    ));
}

export function decoratedBuckets(buckets, itemCache, dateDataSets, visualizationType) {
    return buckets
        .reduce((memo, bucket, keyName) => memo.set(keyName,
            decoratedBucket(bucket, itemCache, dateDataSets, visualizationType)), Map())
        .set('original', buckets);
}

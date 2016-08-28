import { SORT_DIR_ASC, SORT_DIR_DESC } from '../../../constants/sort_directions';
import { TABLE, BAR } from '../../../constants/visualizationTypes';

import * as sort from '../sort';

describe('metadata/sort', () => {
    describe('applyBarSort', () => {
        let applyBarSort, buckets;

        beforeEach(() => {
            applyBarSort = sort.applyBarSort;

            buckets = {
                measures: [
                    { measure: {} },
                    { measure: {} },
                    { measure: {} }
                ],
                categories: [
                    { category: {} },
                    { category: {} },
                    { category: {} }
                ]
            };
        });

        it('should do nothing if visualization type is not BAR', () => {
            const result = applyBarSort(TABLE, buckets);

            expect(result).to.eql(buckets);
        });

        it('should clear curent sort and set it on first items', () => {
            buckets.measures[1].measure.sort = { direction: SORT_DIR_ASC };
            buckets.categories[1].category.sort = SORT_DIR_ASC;
            const result = applyBarSort(BAR, buckets);

            expect(result.measures[1].measure.sort).to.eql(null);
            expect(result.categories[1].category.sort).to.eql(null);

            expect(result.measures[0].measure.sort).to.eql({ direction: SORT_DIR_DESC });
            expect(result.categories[0].category.sort).to.eql(SORT_DIR_DESC);
        });
    });

    describe('removeEmptySortProperties', () => {
        let removeEmptySortProperties, buckets;

        beforeEach(() => {
            removeEmptySortProperties = sort.removeEmptySortProperties;

            buckets = {
                measures: [
                    { measure: { sort: null } },
                    { measure: { sort: SORT_DIR_ASC } },
                    { measure: { sort: undefined } }
                ],
                categories: [
                    { category: { sort: '' } },
                    { category: { sort: null } },
                    { category: { sort: SORT_DIR_DESC } }
                ]
            };
        });

        it('should delete all empty sort properties', () => {
            const expectedBuckets = {
                measures: [
                    { measure: {} },
                    { measure: { sort: SORT_DIR_ASC } },
                    { measure: {} }
                ],
                categories: [
                    { category: {} },
                    { category: {} },
                    { category: { sort: SORT_DIR_DESC } }
                ]
            };

            const result = removeEmptySortProperties(buckets);

            expect(result).to.eql(expectedBuckets);
        });
    });
});

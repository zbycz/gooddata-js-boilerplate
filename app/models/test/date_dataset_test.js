import { fromJS } from 'immutable';

import { decoratedDateDataSet, decoratedDateDataSets } from '../date_dataset';
import { GRANULARITY_OPTIONS } from '../granularity';

describe('Decorated DateDataSet', () => {
    let dateDataSet;

    beforeEach(() => {
        dateDataSet = fromJS({
            attributes: [{
                dateType: 'GDC.time.week_us',
                dfIdentifier: 'date.aa281lMifn6q',
                dfUri: '/gdc/md/TeamOneGoodSales1/obj/15259',
                dimensionUri: '/gdc/md/TeamOneGoodSales1/obj/15174',
                elementsUri: '/gdc/md/TeamOneGoodSales1/obj/15259/elements',
                granularity: 'date.euweek',
                identifier: 'date.euweek',
                summary: 'Week/Year based on EU Weeks (Mon-Sun).',
                title: 'Week (Sun-Sat)/Year (Date)',
                uri: '/gdc/md/TeamOneGoodSales1/obj/15254'
            }, {
                dateType: 'GDC.time.date',
                dfIdentifier: 'date.date.mmddyyyy',
                dfUri: '/gdc/md/TeamOneGoodSales1/obj/15203',
                dimensionUri: '/gdc/md/TeamOneGoodSales1/obj/15174',
                elementsUri: '/gdc/md/TeamOneGoodSales1/obj/15203/elements',
                granularity: 'date.date',
                identifier: 'date.date',
                summary: 'Date',
                title: 'Date (Date)',
                uri: '/gdc/md/TeamOneGoodSales1/obj/15200'
            }],
            id: 'date.dim_date',
            identifier: 'date.dim_date',
            isAvailable: true,
            summary: 'Date dimension (Date)',
            title: 'Date dimension (Date)',
            type: 'dimension',
            uri: '/gdc/md/TeamOneGoodSales1/obj/15174'
        });
    });

    describe('date dataset', () => {
        let decorated;

        beforeEach(() => {
            decorated = decoratedDateDataSet(dateDataSet);
        });

        it('attributeTitle should be correctly set', () => {
            expect(decorated.get('attributeTitle')).to.equal('Date');
        });

        it('isDisabled should be correctly set', () => {
            expect(decorated.get('isDisabled')).to.equal(false);

            dateDataSet = dateDataSet.set('isAvailable', false);
            decorated = decoratedDateDataSet(dateDataSet);

            expect(decorated.get('isDisabled')).to.equal(true);
        });

        function expectAttribute(attribute, option) {
            expect(attribute.get('dateType')).to.equal(option.dateType);
            expect(attribute.get('label')).to.equal(option.label);
        }

        it('attributes should be correctly set', () => {
            expect(decorated.get('attributes').size).to.equal(2);
            expectAttribute(decorated.getIn(['attributes', 0]), GRANULARITY_OPTIONS[0]);
            expectAttribute(decorated.getIn(['attributes', 1]), GRANULARITY_OPTIONS[1]);
        });
    });

    describe('dimensions', () => {
        let dateDataSets, decorated;

        beforeEach(() => {
            dateDataSets = fromJS({
                available: [dateDataSet],
                unavailable: 1,
                dimension: null,
                granularity: null
            });

            decorated = decoratedDateDataSets(dateDataSets);
        });

        it('should set items', () => {
            expect(decorated.get('items').size).to.equal(1);
        });

        it('should set isAvailable', () => {
            expect(decorated.getIn(['items', 0, 'isAvailable'])).to.equal(true);
        });
    });
});

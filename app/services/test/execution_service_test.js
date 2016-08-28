import { replaceDateDataSetTitle } from '../execution_service';

describe('execution_service', () => {
    describe('#replaceDateDataSetTitle', () => {
        let paydateHeaderItem;

        beforeEach(() => {
            paydateHeaderItem = {
                id: 'paydate.aag81lMifn6q',
                title: 'Year (Created (something))',
                type: 'attrLabel',
                uri: '/gdc/md/project/obj/1'
            };
        });

        it('does not break on empty input', () => {
            expect(replaceDateDataSetTitle(null)).to.equal(null);
        });

        it('strips date title', () => {
            let data = {
                headers: [
                    paydateHeaderItem
                ]
            };

            let result = replaceDateDataSetTitle(data, ['paydate']);
            expect(result.headers[0].title).to.equal('Created (something)');
        });

        it('doesnt strip non-date title', () => {
            let data = {
                headers: [
                    paydateHeaderItem
                ]
            };

            let result = replaceDateDataSetTitle(data, []);
            expect(result.headers[0].title).to.equal('Year (Created (something))');
        });
    });
});

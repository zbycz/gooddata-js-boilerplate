/* eslint no-console: 0 */

import { t } from '../translations';
import en from '../../translations/en';

describe('Translations test', () => {
    describe('t', () => {
        it('should return translate message if translation exists', () => {
            expect(t('bucket_item_types.attribute')).to.eql(en['bucket_item_types.attribute']);
        });

        describe('error handling', () => {
            beforeEach(() => {
                sinon.stub(console, 'error');
            });

            it('should return empty string and log message by default', () => {
                expect(t()).to.eql('');
                expect(console.error).to.be.calledOnce();
            });

            it('should return passed key if translation does not exist', () => {
                const nonExistentKey = 'non-existing key, random number 493045';

                expect(t(nonExistentKey)).to.eql(nonExistentKey);
                expect(console.error).to.be.calledOnce();
            });

            afterEach(() => {
                console.error.restore();
            });
        });
    });
});

import { isLoggedInViaSso, SSO_LOGIN_COOKIE } from '../sso';

describe('#sso', () => {
    describe('isLoggedInViaSso', () => {
        it('should return false if SSO cookie is not present', () => {
            expect(isLoggedInViaSso({ cookie: 'abcdefghabcdefgh' })).to.equal(false);
        });

        it('should return true if SSO cookie is present', () => {
            expect(isLoggedInViaSso({ cookie: `abcdefgh${SSO_LOGIN_COOKIE}abcdefgh` })).to.equal(true);
        });
    });
});

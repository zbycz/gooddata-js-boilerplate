import {
    getProjectIdFromUri,
    getHashParam,
    setHashParam,
    getProjectUri
} from '../location';

describe('location utils', () => {
    describe('getProjectIdFromUri', () => {
        it('returns null by default', () => {
            expect(getProjectIdFromUri('')).to.equal(null);
        });

        it('returns project id from URI hash', () => {
            let id = 'budtwmhq7k94vsd234dsf49j3620rzsm3u1';

            expect(getProjectIdFromUri(`#/${id}/reportId/edit`)).to.equal(id);
        });
    });

    describe('getHashParam', () => {
        it('returns null by default', () => {
            expect(getHashParam('dataset', '')).to.equal(null);
        });

        it('returns dataset id from URI hash', () => {
            let currentHash = '#/pid/edit/reportId?dataset=foo';
            expect(getHashParam('dataset', currentHash)).to.equal('foo');
        });
    });

    describe('setHashParam', () => {
        it('should add query if there is none present', () => {
            let currentHash = '#/pid/edit/reportId';
            expect(setHashParam('dataset', 'mycsv', currentHash)).to.eql('#/pid/edit/reportId?dataset=mycsv');
        });

        it('should edit existing dataset id if one is present', () => {
            let currentHash = '#/pid/edit/reportId?dataset=foo';
            expect(setHashParam('dataset', 'mycsv', currentHash)).to.eql('#/pid/edit/reportId?dataset=mycsv');
        });

        it('should add dataset to the end of query if it is present but does not contain dataset', () => {
            let currentHash = '#/pid/edit/reportId?someParam=someValue';
            expect(setHashParam('dataset', 'mycsv', currentHash)).to.eql('#/pid/edit/reportId?someParam=someValue&dataset=mycsv');
        });

        it('should remove dataset parameter if it is null', () => {
            let currentHash = '#/pid/edit/reportId?dataset=foo';
            expect(setHashParam('dataset', null, currentHash)).to.eql('#/pid/edit/reportId');
        });
    });

    describe('getProjectUri', () => {
        it('should return full uri for project', () => {
            const projectId = 'myProjectId';
            const windowInstance = {
                location: {
                    pathname: 'prefix'
                }
            };
            expect(getProjectUri(windowInstance, projectId)).to.eql('prefix#/myProjectId/reportId/edit');
        });
    });
});

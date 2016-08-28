import * as API from '../api.js';
import sdk from 'gooddata';

describe('API test', () => {
    describe('loadDataSets', () => {
        it('should load only datasets which are fully loaded', () => {
            const loadedDataset = {
                name: 'first',
                datasetId: '/id/1',
                firstSuccessfulUpdate: { owner: { profileUri: '/author/1' } },
                datasetLoadStatus: 'OK'
            };

            const loadInProgressDataset = {
                name: 'second',
                datasetId: '/id/2',
                firstSuccessfulUpdate: { owner: { profileUri: '/author/1' } },
                datasetLoadStatus: 'RUNNING'
            };

            const xhrResult = {
                datasets: {
                    items: [
                        { dataset: loadedDataset },
                        { dataset: loadInProgressDataset }
                    ]
                }
            };

            const stub = sinon.stub(sdk.xhr, 'get', () => Promise.resolve(xhrResult));

            return API.loadDatasets('/proj').then(result => {
                const expected = [{
                    name: loadedDataset.name,
                    identifier: loadedDataset.datasetId,
                    author: loadedDataset.firstSuccessfulUpdate.owner.profileUri
                }];

                expect(result).to.eql(expected);
                stub.restore();
            });
        });
    });

    describe('loadAttributeElementsSelection', () => {
        it('should call valid elements resource', done => {
            const total = 100;
            const displayForm = '/df/1';
            const displayFormElements = ['/df/1?elem=1', '/df/2?elem=2'];
            const elementItemsDetail1 = { uri: '/df/elem1' };
            const elementItemsDetail2 = { uri: '/df/elem2' };

            const validElementsRequestStub = sinon.stub();

            const expectedWithLimitUri = [`${displayForm}/validElements?limit=545`];
            const expectedSelectionArgs = [`${displayForm}/validElements`, displayFormElements];

            validElementsRequestStub.withArgs(...expectedWithLimitUri).returns({
                validElements: {
                    items: [{ element: elementItemsDetail1 }],
                    paging: {
                        total
                    }
                }
            });
            validElementsRequestStub.withArgs(...expectedSelectionArgs).returns({
                validElements: {
                    items: [{ element: elementItemsDetail2 }]
                }
            });

            return API.loadAttributeElementsSelection(displayForm, displayFormElements, validElementsRequestStub).then(result => {
                expect(validElementsRequestStub).to.be.calledTwice();

                expect(result.total).to.equal(total);
                expect(result.items).to.eql([elementItemsDetail1, elementItemsDetail2]);
                done();
            });
        });
    });

    describe('saveReport', () => {
        let postFn, updateFn, saveReportConfig;

        beforeEach(() => {
            postFn = sinon.spy((uri, reportMDObject) => Promise.resolve(reportMDObject));
            updateFn = sinon.spy((uri, reportMDObject) => Promise.resolve(reportMDObject));
            saveReportConfig = {
                projectId: 'projectId',
                reportMDObject: {
                    visualization: {
                        meta: {
                            uri: 'foo',
                            updated: '2015-01-01 15:42'
                        },
                        content: null
                    }
                },
                isUpdate: false,
                createFunction: postFn,
                updateFunction: updateFn
            };
        });

        it('should call post new object when creating', () => {
            API.saveReport(saveReportConfig);

            expect(postFn).to.be.calledOnce();
            expect(updateFn).not.to.be.called();
        });

        it('should call put update object when updating', () => {
            API.saveReport({
                ...saveReportConfig,
                isUpdate: true
            });

            expect(postFn).not.to.be.called();
            expect(updateFn).to.be.calledOnce();
        });

        it('should strip meta.updated when creating visualization', () => {
            API.saveReport(saveReportConfig);

            const mdObject = postFn.getCall(0).args[1];
            expect(mdObject.visualization.meta.updated).to.equal(undefined);
        });

        it('should strip meta.updated when updating visualization', () => {
            API.saveReport({
                ...saveReportConfig,
                isUpdate: true
            });

            const mdObject = updateFn.getCall(0).args[1];
            expect(mdObject.visualization.meta.updated).to.equal(undefined);
        });
    });
});

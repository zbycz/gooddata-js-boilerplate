import Promise from 'bluebird';
import { range } from 'lodash';

import DataSource, { mergeItems } from '../data_source';


describe('DataSource', () => {
    describe('#mergeItems', () => {
        it('should merge items from paged query to initial request data', () => {
            const initial = {
                data: {
                    items: [1, 2, 3],
                    totalCount: 10
                }
            };

            const paged = {
                data: {
                    items: [4, 5, 6],
                    offset: 3,
                    limit: 3
                }
            };

            const res = mergeItems(initial, paged);

            expect(res.data.items).to.eql(
                [1, 2, 3, 4, 5, 6, undefined, undefined, undefined, undefined]
            );
        });

        it('should merge data with initial offset for static items', () => {
            const initial = {
                data: {
                    items: [{}, {}, 1, 2, 3],
                    totalCount: 12
                },
                meta: {
                    offset: 2
                }
            };

            const paged = {
                data: {
                    items: [4, 5, 6],
                    offset: 5,
                    limit: 3
                }
            };

            const res = mergeItems(initial, paged);

            expect(res.data.items).to.eql(
                [{}, {}, 1, 2, 3, undefined, undefined, 4, 5, 6, undefined, undefined]
            );
        });

        it('should keep extra data from response', () => {
            const initial = {
                data: {
                    items: [{}, {}, 1, 2, 3],
                    totalCount: 12,
                    allDataCount: 666
                },
                meta: {
                    offset: 2
                }
            };

            const paged = {
                data: {
                    items: [4, 5, 6],
                    offset: 5,
                    limit: 3
                }
            };

            const res = mergeItems(initial, paged);

            expect(res.data.totalCount).to.eql(12);
            expect(res.data.allDataCount).to.equal(666);
        });

        it('should keep metadata from intial response', () => {
            const initial = {
                data: {
                    items: [{}, {}, 1, 2, 3],
                    totalCount: 12,
                    allDataCount: 666
                },
                meta: {
                    offset: 2
                }
            };

            const paged = {
                data: {
                    items: [4, 5, 6],
                    offset: 5,
                    limit: 3
                }
            };

            const res = mergeItems(initial, paged);

            expect(res.meta.offset).to.eql(2);
        });
    });

    describe('#makeQuery', () => {
        it('should publish change with initial data', done => {
            const initial = {
                data: {
                    items: [1, 2, 3, undefined, undefined],
                    totalCount: 5
                }
            };

            const makeInitialRequest = () => Promise.resolve(initial);

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };


            const query = { filter: '1234' };
            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            const handleChange = response => {
                expect(response.data.items).to.eql([1, 2, 3, undefined, undefined]);
                done();
            };

            ds.onChange(handleChange);
            ds.getData(query);
        });

        it('should not invoke change subscribtion after reset', done => {
            const makeInitialRequest = () => Promise.resolve({
                data: {
                    items: [1, 2, 3, undefined, undefined],
                    totalCount: 5
                }
            });

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };

            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            const handleChange = sinon.spy();

            const query = { filter: '1234' };
            ds.onChange(handleChange);
            ds.getData(query);

            ds.resetChangeSubscriptions();
            ds._emitChange({});

            setTimeout(() => {
                expect(handleChange).not.to.be.called();
                done();
            }, 0);
        });

        it('should make only one initial query', done => {
            const makeInitialRequest = sinon.stub().returns(Promise.resolve({
                data: {
                    items: [1, 2, 3, undefined, undefined],
                    totalCount: 5
                }
            }));

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };


            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            const handleChange = () => {
                expect(makeInitialRequest).to.be.calledOnce();
                done();
            };

            ds.onChange(handleChange);
            ds.getData({ filter: 'aaa' });
        });

        it('should provide initialLoad on first query', done => {
            const initial = {
                data: {
                    items: [1, 2, 3, undefined, undefined],
                    totalCount: 5
                }
            };

            const makeInitialRequest = () => Promise.resolve(initial);

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };

            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            const handleChange = response => {
                expect(response.initialLoad).to.equal(true);
                done();
            };

            ds.onChange(handleChange);
            ds.getData({});
        });

        it('should publish change with meta.query', done => {
            const initial = {
                data: {
                    items: [1, 2, 3, undefined, undefined],
                    totalCount: 5
                }
            };

            const makeInitialRequest = () => Promise.resolve(initial);

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };


            const query = { filter: '1234' };
            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            const handleChange = response => {
                expect(response.meta.query).to.eql(query);
                done();
            };

            ds.onChange(handleChange);
            ds.getData(query);
        });

        it('should publish change with two initial data requests', done => {
            const makeInitialRequest = query => {
                const res = {
                    data: {
                        items: query.filter.split('').map(x => +x),
                        totalCount: 5
                    }
                };
                return Promise.resolve(res);
            };

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };


            const query = { filter: '123' };
            const query2 = { filter: '567' };
            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            const handleChange = response => {
                expect(response.data.items).to.eql([5, 6, 7, undefined, undefined]);

                done();
            };

            ds.onChange(handleChange);

            ds.getData(query);
            ds.getData(query2);
        });

        it('should publish only the last query results (not the last results returned)', done => {
            const makeInitialRequest = query => {
                const res = {
                    data: {
                        items: query.filter.split('').map(x => +x),
                        totalCount: 5
                    }
                };

                // delay response by timeout specified in query
                return new Promise(resolve => {
                    setTimeout(() => resolve(res), query.timeout);
                });
            };

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };


            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            const handleChange = response => {
                expect(response.data.items).to.eql([5, 6, 7, undefined, undefined]);
                done();
            };

            ds.onChange(handleChange);

            const query = { filter: '123', timeout: 15 };
            const query2 = { filter: '567', timeout: 5 };

            ds.getData(query);
            ds.getData(query2);
        });
    });

    describe('#getRowAt', () => {
        it('should publish change with one buffered row request', done => {
            const initial = {
                data: {
                    items: [1, 2, 3],
                    totalCount: 5
                }
            };

            const makeInitialRequest = () => Promise.resolve(initial);

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };

            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            const responses = [];
            const handleChange = response => {
                responses.push(response);
                if (responses.length < 2) {
                    return;
                }

                expect(response.data.items).to.eql([1, 2, 3, 4, undefined]);
                done();
            };

            ds.onChange(handleChange);

            ds.getData({});
            ds.getRowAt(3);
        });

        it('should use initial query to make paged queries', done => {
            const makeInitialRequest = () => Promise.resolve({
                data: {
                    items: [1, 2, 3],
                    totalCount: 5
                }
            });

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        // check that query is propagated correctly
                        // in case it's not this will throw an error like Cannot read property '0' of undefined
                        items: [(query.paging.offset + 1) + query.types[0]]
                    }
                };

                return Promise.resolve(res);
            };

            const ds = new DataSource(makeInitialRequest, makePagedRequest, { pageSize: 1 });

            const responses = [];
            const expectedResponses = [
                [1, 2, 3, undefined, undefined],
                [1, 2, 3, undefined, '5fact']
            ];
            const handleChange = response => {
                responses.push(response.data.items);
                if (responses.length < 2) {
                    return;
                }

                expect(responses).to.eql(expectedResponses);
                done();
            };

            ds.onChange(handleChange);

            ds.getData({ types: ['fact'] });
            ds.getRowAt(4);
        });

        it('should publish change with two buffered row requests', done => {
            const initial = {
                data: {
                    items: [1, 2, 3],
                    totalCount: 5
                }
            };

            const makeInitialRequest = () => Promise.resolve(initial);

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };

            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            const responses = [];
            const expectedResponses = [
                [1, 2, 3, undefined, undefined],
                [1, 2, 3, 4, undefined],
                [1, 2, 3, 4, 5]
            ];
            const handleChange = response => {
                responses.push(response.data.items);
                if (responses.length < 3) {
                    return;
                }

                expect(responses).to.eql(expectedResponses);
                done();
            };

            ds.onChange(handleChange);

            ds.getData({});

            ds.getRowAt(3);
            ds.getRowAt(4);
        });

        it('should take into account offset from initial data', done => {
            const initial = {
                data: {
                    items: [{}, {}, 1, 2, 3],
                    totalCount: 8
                },
                meta: {
                    offset: 2
                }
            };

            const makeInitialRequest = () => Promise.resolve(initial);

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };


            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            const responses = [];
            const expectedResponses = [
                [{}, {}, 1, 2, 3, undefined, undefined, undefined],
                [{}, {}, 1, 2, 3, undefined, 5, undefined]
            ];
            const handleChange = response => {
                responses.push(response.data.items);
                if (responses.length < 2) {
                    return;
                }

                expect(responses).to.eql(expectedResponses);
                done();
            };

            ds.onChange(handleChange);

            ds.getData({});
            ds.getRowAt(6);
        });

        it('should not take offset into account when checking item existence', done => {
            const initial = {
                data: {
                    items: [{}, {}, 1, 2, 3],
                    totalCount: 8
                },
                meta: {
                    offset: 2
                }
            };

            const makeInitialRequest = () => Promise.resolve(initial);

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };


            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            let responses = 0;
            const handleChange = ({ end }) => {
                responses++;

                if (end) {
                    done();
                }

                if (responses > 1) {
                    done(new Error('Should not make the second request.'));
                }
            };

            ds.onChange(handleChange);

            ds.getData({});
            ds.getRowAt(4);
            ds.__complete();
        });

        it('should make stuff happen - with holes [pure magic]', done => {
            const initial = {
                data: {
                    items: [1, 2, 3],
                    totalCount: 6
                }
            };

            const makeInitialRequest = () => Promise.resolve(initial);

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };

            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            const responses = [];
            const expectedResponses = [
                [1, 2, 3, undefined, undefined, undefined],
                [1, 2, 3, undefined, 5, undefined]
            ];
            const handleChange = response => {
                responses.push(response.data.items);
                if (responses.length < 2) {
                    return;
                }

                expect(responses).to.eql(expectedResponses);
                done();
            };

            ds.onChange(handleChange);

            ds.getData({});

            ds.getRowAt(4);
        });

        it('should not provide initialLoad on paged query', done => {
            const initial = {
                data: {
                    items: [1, 2, 3, undefined, undefined],
                    totalCount: 5
                }
            };

            const makeInitialRequest = () => Promise.resolve(initial);

            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };

            const ds = new DataSource(makeInitialRequest, makePagedRequest, { pageSize: 1 });

            let responsesCount = 0;
            const handleChange = response => {
                responsesCount++;
                if (responsesCount < 2) {
                    return;
                }
                expect(response.initialLoad).not.to.equal(true);
                done();
            };

            ds.onChange(handleChange);
            ds.getData({});
            ds.getRowAt(4);
        });

        it('should return row after being loaded', done => {
            const makeInitialRequest = () => Promise.resolve({
                data: {
                    items: [1, 2, 3, 4, 5],
                    totalCount: 5
                }
            });
            const makePagedRequest = query => {
                const res = {
                    data: {
                        ...query.paging,
                        items: [query.paging.offset + 1]
                    }
                };

                return Promise.resolve(res);
            };

            const ds = new DataSource(makeInitialRequest, makePagedRequest);

            const handleChange = () => {
                expect(ds.getRowAt(4)).to.equal(5);
                done();
            };
            ds.onChange(handleChange);

            ds.getData({});
        });
    });

    describe('paging', () => {
        const makeInitialRequest = () => (Promise.resolve({ data: { totalCount: 10, items: [] } }));
        const makePagedRequest = query => Promise.resolve({
            data: {
                ...query.paging,
                items: range(query.paging.offset, query.paging.offset + query.paging.limit)
            }
        });

        it('should propagate page size to paged query', done => {
            const options = { pageSize: 10 };

            const ds = new DataSource(makeInitialRequest, makePagedRequest, options);

            const responses = [];
            const handleChange = response => {
                responses.push(response);
                if (responses.length < 2) {
                    return;
                }

                expect(response.data.items).to.eql(range(0, 10));
                done();
            };

            ds.onChange(handleChange);

            ds.getData({});
            ds.getRowAt(0);
        });

        it('should combine more row request into single page request', done => {
            const options = { pageSize: 10 };

            const ds = new DataSource(makeInitialRequest, makePagedRequest, options);

            let requestCount = 0;
            const handleChange = ({ end }) => {
                requestCount++;

                if (end) {
                    done();
                    return;
                }

                if (requestCount > 2) {
                    done(new Error('Should not make more than 2 requests.'));
                }
            };

            ds.onChange(handleChange);

            ds.getData({});
            ds.getRowAt(1);
            ds.getRowAt(2);
            ds.getRowAt(3);
            ds.getRowAt(4);
            ds.getRowAt(5);
            ds.getRowAt(6);
            ds.getRowAt(7);

            ds.__complete();
        });

        it('should not send the same page request multiple times', done => {
            const options = { pageSize: 5 };

            const ds = new DataSource(makeInitialRequest, makePagedRequest, options);

            let requestCount = 0;
            const handleChange = ({ end }) => {
                requestCount++;

                if (end) {
                    done();
                    return;
                }

                if (requestCount > 3) {
                    done(new Error('Should not make more than 3 requests.'));
                }
            };

            ds.onChange(handleChange);

            ds.getData({});
            ds.getRowAt(1);
            ds.getRowAt(5);
            ds.getRowAt(1);
            ds.getRowAt(5);

            ds.__complete();
        });

        it('should request all items', done => {
            const options = { pageSize: 10 };

            const initialResponse = {
                data: {
                    items: [{}, {}, ...range(0, 10)],
                    totalCount: 122
                },
                meta: {
                    offset: 2
                }
            };
            const makeInitialRequestLocal = () => Promise.resolve(initialResponse);

            const ds = new DataSource(makeInitialRequestLocal, makePagedRequest, options);

            let lastResponse = 0;
            const handleChange = response => {
                if (response.end) {
                    const expectedData = mergeItems(initialResponse, {
                        data: {
                            items: range(80, 120),
                            offset: 80,
                            limit: 40
                        }
                    }).data;


                    expect(lastResponse.data).to.eql(expectedData);

                    done();
                    return;
                }

                lastResponse = response;
            };

            ds.onChange(handleChange);

            ds.getData({});
            ds.getRowAt(91);
            ds.getRowAt(101);
            ds.getRowAt(111);
            ds.getRowAt(121);

            ds.__complete();
        });

        it('should not request available data', done => {
            const options = { pageSize: 10 };
            const initial = {
                data: {
                    items: range(0, 20),
                    totalCount: 100
                }
            };

            const makeInitialRequestLocal = () => Promise.resolve(initial);

            const ds = new DataSource(makeInitialRequestLocal, makePagedRequest, options);

            let requestCount = 0;
            const handleChange = ({ end }) => {
                requestCount++;

                if (end) {
                    done();
                    return;
                }

                if (requestCount > 1) {
                    done(new Error('Should not make more than 1 request.'));
                }
            };

            ds.onChange(handleChange);

            ds.getData({});
            ds.getRowAt(1);
            ds.getRowAt(2);
            ds.getRowAt(3);
            ds.getRowAt(4);
            ds.getRowAt(5);
            ds.getRowAt(6);
            ds.getRowAt(7);

            ds.__complete();
        });
    });
});

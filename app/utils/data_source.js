import Promise from 'bluebird';

import { ReplaySubject, Observable } from 'rxjs/Rx';
import { isEqual } from 'lodash';

import 'rxjs/add/operator/distinct';


export function mergeItems(initialData, pagedData) {
    const initialItems = initialData.data.items;
    // we need to make sure the array contains the right amount of items
    initialItems.length = initialData.data.totalCount;

    const initialOffset = (initialData.meta && initialData.meta.offset) || 0;

    const { offset, limit } = pagedData.data;

    const items = [
        ...(initialItems.slice(0, initialOffset + offset)),
        ...pagedData.data.items,
        ...(initialItems.slice(initialOffset + offset + limit))
    ];

    return {
        data: {
            ...initialData.data,
            items
        },
        meta: initialData.meta
    };
}

const EMPTY_PAGED_DATA = {
    data: {
        items: [],
        offset: 0,
        limit: 0
    }
};

const DEFAULT_OPTIONS = {
    pageSize: 1
};

const executeQuery = makeRequest => query => {
    const request = Promise
        .props({
            response: makeRequest(query),
            query
        })
        // add query to response metadata
        .then(({ response }) => ({
            response: {
                ...response,
                meta: {
                    ...response.meta,
                    query
                }
            }
        }));

    return Observable.fromPromise(request);
};

export default class DataSource {
    constructor(makeInitialRequest, makePagedRequest, options) {
        this.options = { ...DEFAULT_OPTIONS, ...options };

        this._createQueryStream = this._createQueryStream.bind(this);
        this._createRowStream = this._createRowStream.bind(this);
        this.getRowAt = this.getRowAt.bind(this);
        this.onChange = this.onChange.bind(this);
        this.getData = this.getData.bind(this);

        this.makeInitialRequest = makeInitialRequest;
        this.makePagedRequest = makePagedRequest;

        this._errorSubscriptions = [];
        this._changeSubscriptions = [];
        this._disposables = [];
        this.state = { data: { items: [] } };
    }

    resetChangeSubscriptions() {
        this._changeSubscriptions = [];
    }

    disposeSubscriptions() {
        this._disposables.forEach(subscription => {
            subscription.unsubscribe();
        });

        this._disposables = [];
    }

    __complete() {
        setTimeout(() => {
            this._disposables.forEach(subscription => {
                subscription.complete();
            });
        }, 0);
    }

    using(subscription) {
        this._disposables.push(subscription);
    }

    _createQueryStream(initialQuery) {
        this.disposeSubscriptions();
        const rowRequest$ = this._createRowStream();

        const initialData$ = executeQuery(this.makeInitialRequest)(initialQuery);

        this.using(
            initialData$.subscribe(
                data => {
                    const normalizedData = mergeItems(data.response, EMPTY_PAGED_DATA);
                    this.state = normalizedData;

                    this._emitChange({ ...normalizedData, initialLoad: true });
                },
                err => {
                    this._emitError(err);
                }
            )
        );

        const toPages = (response, row$) => {
            const initialOffset = (response.meta && response.meta.offset) || 0;

            function findPageNum(rowNum, pageSize) {
                return Math.floor(rowNum / pageSize);
            }

            function notYetLoaded(rowNum) {
                return !response.data.items[rowNum];
            }

            return row$
                .filter(notYetLoaded)
                .map(rowNum => rowNum - initialOffset)
                .filter(rowNum => rowNum >= 0)
                .map(rowNum => ({
                    offset: findPageNum(rowNum, this.options.pageSize) * this.options.pageSize,
                    limit: this.options.pageSize
                }))
                .distinct(isEqual);
        };

        const pagedData$ = initialData$
            .flatMap(wrappedInitialResponse => {
                const initialResponse = wrappedInitialResponse.response;

                const row$ = toPages(initialResponse, rowRequest$)
                    .map(paging => ({ ...initialResponse.meta.query, paging }))
                    .flatMap(executeQuery(this.makePagedRequest))
                    .scan(
                        (mergedResponse, wrappedPageResponse) => mergeItems(mergedResponse, wrappedPageResponse.response)
                        , initialResponse
                    );

                return row$;
            });

        this.using(
            pagedData$.subscribe(
                data => {
                    this.state = data;

                    this._emitChange(data);
                },
                err => {
                    this._emitError(err);
                },
                () => {
                    this._emitChange({ end: true });
                }
            )
        );
    }

    _createRowStream() {
        let stream = new ReplaySubject();

        this.pagedQuerySource = stream.next.bind(stream);

        return stream;
    }

    _emitChange(change) {
        setTimeout(() => {
            this._changeSubscriptions.forEach(handleChange => handleChange(change));
        }, 0);
    }

    _emitError(error) {
        setTimeout(() => {
            this._errorSubscriptions.forEach(handleError => handleError(error));
        }, 0);
    }

    getData(query) {
        this._createQueryStream(query);
    }

    getRowAt(rowIndex) {
        const rows = this.state.data.items;
        if (rows[rowIndex]) {
            return rows[rowIndex];
        }

        this.pagedQuerySource(rowIndex);
        return null;
    }

    onChange(changeHandler) {
        const len = this._changeSubscriptions.push(changeHandler);

        return () => {
            this._changeSubscriptions.splice(len - 1, 1);
        };
    }

    onError(errorHandler) {
        const len = this._errorSubscriptions.push(errorHandler);

        return () => {
            this._errorSubscriptions.splice(len - 1, 1);
        };
    }
}

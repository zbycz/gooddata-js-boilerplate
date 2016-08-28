import { isUndefined, range, first, last } from 'lodash';

const PENDING = 'pending';
const LOADED = 'loaded';


export function mergeItems(items, newItems, start) {
    let itemsCopy = items.slice();

    for (let i = 0; i < newItems.length; i++) {
        itemsCopy[start + i] = newItems[i];
    }

    return itemsCopy;
}


export class PageTracker {
    constructor(itemsPerPage = 20) {
        this.itemsPerPage = itemsPerPage;

        this.reset();
    }

    reset() {
        this.pages = {};
    }

    getPagesToLoad(start, end) {
        let pages = this.getPagesInRange(start, end),
            pagesToLoad = [];

        for (let pageNo of pages) {
            if (isUndefined(this.pages[pageNo])) {
                pagesToLoad.push(pageNo);
            }
        }

        this.markPagesAsPending(pagesToLoad);

        return pagesToLoad;
    }

    getRangeToLoad(start, end) {
        let pages = this.getPagesToLoad(start, end);

        if (!pages.length) { return null; }

        return {
            offset: first(pages) * this.itemsPerPage,
            limit: (last(pages) - first(pages) + 1) * this.itemsPerPage
        };
    }

    getPagesInRange(start, end) {
        let startPage = Math.floor(start / this.itemsPerPage),
            endPage = Math.floor(end / this.itemsPerPage);

        return range(startPage, endPage + 1);
    }

    _markPages(pageNums, status) {
        for (let pageNo of pageNums) {
            this.pages[pageNo] = status;
        }
    }

    markPagesAsPending(pageNums) {
        this._markPages(pageNums, PENDING);
    }

    markRangeAsPending(start, end) {
        let pages = this.getPagesInRange(start, end);
        this.markPagesAsPending(pages);
    }

    markPagesAsLoaded(pageNums) {
        this._markPages(pageNums, LOADED);
    }

    markRangeAsLoaded(start, end) {
        let pages = this.getPagesInRange(start, end);
        this.markPagesAsLoaded(pages);
    }

    getPageOffset(pageNo) {
        return this.itemsPerPage * pageNo;
    }
}

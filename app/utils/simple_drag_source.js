import { DragSource } from 'dnd-core/lib';

export default class Source extends DragSource {
    constructor(item) {
        super();
        this.item = item;
    }

    beginDrag() {
        return this.item || {};
    }
}

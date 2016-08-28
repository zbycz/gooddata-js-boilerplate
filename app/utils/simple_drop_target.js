import { DropTarget } from 'dnd-core/lib';
import { identity } from 'lodash';

export default class Target extends DropTarget {
    constructor(onDropped = identity) {
        super();
        this.onDropped = onDropped;
    }

    drop(monitor) {
        const result = monitor.getItem();
        return this.onDropped(result);
    }
}

import { Map, List } from 'immutable';
import { indexBy, p } from '../immutable';

describe('immutable helper functions', () => {
    describe('indexBy', () => {
        it('converts immutable List to Map with correct keys', () => {
            const items = ['A', 'B', 'C'].map(letter => Map({ id: letter, title: `Chapter ${letter}` }));
            const list = List(items);

            let itemsBy = indexBy(list, 'id');

            expect(itemsBy.get('A')).to.equal(items[0]);
            expect(itemsBy.get('B')).to.equal(items[1]);
            expect(itemsBy.get('C')).to.equal(items[2]);

            itemsBy = indexBy(list, 'title');

            expect(itemsBy.get('Chapter A')).to.equal(items[0]);
            expect(itemsBy.get('Chapter B')).to.equal(items[1]);
            expect(itemsBy.get('Chapter C')).to.equal(items[2]);
        });
    });

    describe('p', () => {
        it('converts dot-separated string to key path', () => {
            let keyPath = p('my.long.path.with.some.numerical.indices.123.034.22223456.0.-1');

            expect(keyPath.length).to.equal(12);
            expect(keyPath[0]).to.equal('my');
            expect(keyPath[7]).to.equal(123);
            expect(keyPath[8]).to.equal(34);
            expect(keyPath[9]).to.equal(22223456);
            expect(keyPath[10]).to.equal(0);
            expect(keyPath[11]).to.equal('-1');
        });
    });
});

import { delayGenerator } from '../generators';
import { times } from 'lodash';

describe('delayGenerator', () => {
    it('should return fast delays for n iterations', () => {
        const poller = delayGenerator(2);

        const delays = times(5).map(() => poller.next().value);

        expect(delays).to.eql([200, 200, 1000, 1000, 1000]);
    });
});

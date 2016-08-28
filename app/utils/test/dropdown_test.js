import {
    DROPDOWN_MIN_HEIGHT,
    DROPDOWN_MAX_HEIGHT,
    getDialogHeight
} from '../dropdown';

const LOW_WINDOW_HEIGHT = 360; // TWICE DROPDOWN_MIN_HEIGHT
const HIGH_WINDOW_HEIGHT = 1024;

describe('getDialogHeight', () => {
    let windowObj;

    describe('when viewport height is low', () => {
        beforeEach(() => {
            windowObj = {
                innerHeight: LOW_WINDOW_HEIGHT,
                pageYOffset: 0
            };
        });

        it('and button is near the vertical center, should equal minimum dialog height', () => {
            expect(getDialogHeight(LOW_WINDOW_HEIGHT / 2, windowObj)).to.eql(DROPDOWN_MIN_HEIGHT);
        });

        it('and button is near the top, should calc height to fit dropdown in bottom area', () => {
            const height = getDialogHeight(0, windowObj);

            expect(height).to.be.above(DROPDOWN_MIN_HEIGHT);
            expect(height).to.be.below(DROPDOWN_MAX_HEIGHT);
        });

        it('and button is near the bottom, should use height of top area', () => {
            const height = getDialogHeight(LOW_WINDOW_HEIGHT - 20, windowObj);

            expect(height).to.be.above(DROPDOWN_MIN_HEIGHT);
            expect(height).to.be.below(DROPDOWN_MAX_HEIGHT);
        });
    });

    describe('when viewport height is high', () => {
        beforeEach(() => {
            windowObj = {
                innerHeight: HIGH_WINDOW_HEIGHT,
                pageYOffset: 0
            };
        });

        it('should equal maximum dialog height', () => {
            expect(getDialogHeight(0, windowObj)).to.eql(DROPDOWN_MAX_HEIGHT);
        });
    });
});

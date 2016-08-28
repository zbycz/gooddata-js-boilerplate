import moment from 'moment';

import { presetItem, decoratedPresetItem, getGranularityPresets } from '../preset_item';
import { GRANULARITY } from '../granularity';
import * as PresetNames from '../../constants/presets';

const TIMEZONE_OFFSET_1H = -1000 * 60 * 60;

describe('Decorated Preset Item', () => {
    let baseItem, today;

    function createPresetItem(options) {
        return decoratedPresetItem(presetItem({
            ...baseItem,
            ...options
        }));
    }

    beforeEach(() => {
        today = '2014-10-30T00:00:00.000Z';
        baseItem = { today, granularity: GRANULARITY.date };
    });

    describe('interval', () => {
        it('properties should be correctly set when interval represents floating range', () => {
            let preset = createPresetItem({
                interval: [-1, 0]
            });
            expect(preset.get('isFloating')).to.equal(true);
            expect(preset.get('isStatic')).to.equal(false);
            expect(preset.get('isSingle')).to.equal(false);
            expect(preset.get('isRange')).to.equal(true);
        });

        it('properties should be correctly set when interval represents static range', () => {
            let preset = createPresetItem({
                interval: ['2014-10-29T00:00:00.000Z', '2014-10-30T00:00:00.000Z']
            });
            expect(preset.get('isFloating')).to.equal(false);
            expect(preset.get('isStatic')).to.equal(true);
            expect(preset.get('isSingle')).to.equal(false);
            expect(preset.get('isRange')).to.equal(true);
        });

        it('properties should be correctly set when interval represents single floating date', () => {
            let preset = createPresetItem({
                interval: [-1, -1]
            });
            expect(preset.get('isFloating')).to.equal(true);
            expect(preset.get('isStatic')).to.equal(false);
            expect(preset.get('isSingle')).to.equal(true);
            expect(preset.get('isRange')).to.equal(false);
        });

        it('properties should be correctly set when interval represents single static date', () => {
            let preset = createPresetItem({
                interval: ['2014-10-30T00:00:00.000Z', '2014-10-30T00:00:00.000Z']
            });
            expect(preset.get('isFloating')).to.equal(false);
            expect(preset.get('isStatic')).to.equal(true);
            expect(preset.get('isSingle')).to.equal(true);
            expect(preset.get('isRange')).to.equal(false);
        });
    });

    describe('template', () => {
        before(() => {
            baseItem = {};
        });

        it('should return header id when item is a header', () => {
            let preset = createPresetItem({ header: 'day' });
            expect(preset.get('template')).to.equal('day');
        });

        it('should return all time id when no interval is set', () => {
            let preset = createPresetItem({});
            expect(preset.get('template')).to.equal('date.title.allTime');
        });

        it('should return correct id for static intervals', () => {
            let preset = createPresetItem({
                granularity: GRANULARITY.date,
                interval: ['2014-10-29T00:00:00.000Z', '2014-10-30T00:00:00.000Z']
            });

            expect(preset.get('template')).to.equal('date.interval.title.range');

            preset = createPresetItem({
                granularity: GRANULARITY.date,
                interval: ['2014-10-30T00:00:00.000Z', '2014-10-30T00:00:00.000Z']
            });

            expect(preset.get('template')).to.equal('date.interval.title.single');
        });

        it('should return correct id for floating single dates', () => {
            let preset = createPresetItem({
                granularity: GRANULARITY.date,
                interval: [-1, -1]
            });

            expect(preset.get('template')).to.equal('date.floating.title.single.last');

            preset = createPresetItem({
                granularity: GRANULARITY.date,
                interval: [0, 0]
            });

            expect(preset.get('template')).to.equal('date.floating.title.single.this');
        });

        it('should return correct id for floating range', () => {
            let preset = createPresetItem({
                granularity: GRANULARITY.date,
                interval: [-1, 0]
            });

            expect(preset.get('template')).to.equal('date.floating.title.range.last');
        });
    });

    describe('unit config', () => {
        it('unitCount should return number of units for floating value', () => {
            let preset = createPresetItem({ interval: [-1, 0] });
            expect(preset.get('unitCount')).to.equal(2);
        });

        it('unitTitle should return correct title for floating value', () => {
            let preset = createPresetItem({ interval: [-1, 0] });
            expect(preset.get('unitTitle')).to.equal('days');

            preset = createPresetItem({ interval: [-1, -1] });
            expect(preset.get('unitTitle')).to.equal('day');
        });

        it('moment config settings should be correctly initialized', () => {
            let preset = createPresetItem({});
            expect(preset.get('unitAbbrev')).to.equal('d');
            expect(preset.get('unitFullName')).to.equal('day');
            expect(preset.get('unitFormat')).to.equal('MMM D, YYYY');
        });
    });

    describe('period', () => {
        it('should return start and end correctly for static interval', () => {
            let period = createPresetItem({
                    interval: ['2014-10-29T00:00:00.000Z', '2014-10-30T00:00:00.000Z']
                }).getPeriod(),
                start = period.get('start'),
                end = period.get('end');

            expect(start.getUTCFullYear()).to.equal(2014);
            expect(start.getUTCDate()).to.equal(29);
            expect(end.getUTCDate()).to.equal(30);
        });

        it('should return start and end correctly for floating interval', () => {
            let period = createPresetItem({
                    granularity: GRANULARITY.date,
                    interval: [-1, 0]
                }).getPeriod(0, 0),
                start = period.get('start'),
                end = period.get('end');

            expect(start.getUTCFullYear()).to.equal(2014);
            expect(start.getUTCDate()).to.equal(29);
            expect(end.getUTCDate()).to.equal(30);
        });

        it('should return start and end correctly for floating interval with timezone offset', () => {
            let period = createPresetItem({
                    granularity: GRANULARITY.date,
                    interval: [-1, 0]
                }).getPeriod(TIMEZONE_OFFSET_1H, 0),
                start = period.get('start'),
                end = period.get('end');

            expect(start.getUTCFullYear()).to.equal(2014);
            expect(start.getUTCDate()).to.equal(28);
            expect(end.getUTCDate()).to.equal(29);
        });
    });

    describe('formattedPeriod', () => {
        it('should return period start and end correctly formatted as strings', () => {
            let formattedPeriod = createPresetItem({
                    granularity: GRANULARITY.date,
                    interval: [-1, 0]
                }).getFormattedPeriod(0, 0),
                start = formattedPeriod.get('start'),
                end = formattedPeriod.get('end');

            expect(start).to.equal('Oct 29, 2014');
            expect(end).to.equal('Oct 30, 2014');
        });
    });

    describe('title', () => {
        it('should provide translated header id', () => {
            let preset = createPresetItem({ header: 'day' });
            expect(preset.getTitle()).to.equal('Day');
        });

        it('should construct correct floating filter title', () => {
            let preset = createPresetItem({});
            expect(preset.getTitle()).to.equal('All time');

            preset = createPresetItem({
                granularity: GRANULARITY.quarter,
                interval: [0, 0]
            });
            expect(preset.getTitle()).to.equal('This quarter');

            preset = createPresetItem({
                granularity: GRANULARITY.month,
                interval: [-1, -1]
            });
            expect(preset.getTitle()).to.equal('Last month');

            preset = createPresetItem({
                granularity: GRANULARITY.month,
                interval: [-4, 0]
            });
            expect(preset.getTitle()).to.equal('Last 5 months');

            preset = createPresetItem({
                granularity: GRANULARITY.date,
                interval: [-7, 0]
            });
            expect(preset.getTitle()).to.equal('Last 8 days');
        });

        it('should construct correct interval filter title', () => {
            let preset = createPresetItem({
                interval: ['2015-01-01T00:00:00.000Z', '2015-02-01T00:00:00.000Z']
            });
            expect(preset.getTitle()).to.equal('Jan 1, 2015 - Feb 1, 2015');
        });
    });

    describe('pickerInterval', () => {
        function expectCorrectInterval(granularity, interval, start, end, timezoneOffset = 0) {
            const preset = createPresetItem({
                    today: moment(new Date(2014, 10, 15)),
                    granularity,
                    interval
                }),
                format = 'MM/DD/YYYY',
                pickerInterval = preset.getPickerInterval(timezoneOffset, 0);

            expect(moment(pickerInterval.get('start')).format(format)).to.eql(start);
            expect(moment(pickerInterval.get('end')).format(format)).to.eql(end);
        }

        it('should generate proper formatted dates for this quarter', () => {
            expectCorrectInterval(GRANULARITY.quarter, [0, 0], '10/01/2014', '12/31/2014');
        });

        it('should generate proper formatted dates for last quarter', () => {
            expectCorrectInterval(GRANULARITY.quarter, [-1, -1], '07/01/2014', '09/30/2014');
        });

        it('should generate proper formatted dates for this month', () => {
            expectCorrectInterval(GRANULARITY.month, [0, 0], '11/01/2014', '11/30/2014');
        });

        it('should generate proper formatted dates for last month', () => {
            expectCorrectInterval(GRANULARITY.month, [-1, -1], '10/01/2014', '10/31/2014');
        });

        it('should generate proper formatted dates for this year', () => {
            expectCorrectInterval(GRANULARITY.year, [0, 0], '01/01/2014', '12/31/2014');
        });

        it('should generate proper formatted dates for last year', () => {
            expectCorrectInterval(GRANULARITY.year, [-1, -1], '01/01/2013', '12/31/2013');
        });

        it('should generate proper formatted dates for date range', () => {
            expectCorrectInterval(GRANULARITY.date, [-7, -1], '11/08/2014', '11/14/2014');
        });

        it('should generate proper formatted dates for date range', () => {
            expectCorrectInterval(GRANULARITY.date, [-1, 0], '11/14/2014', '11/15/2014');
        });

        it('should generate proper formatted dates for more complicated filter with quarters', () => {
            expectCorrectInterval(GRANULARITY.quarter, [-4, -2], '10/01/2013', '06/30/2014');
        });

        it('should generate proper formatted dates with timezone offset', () => {
            expectCorrectInterval(GRANULARITY.date, [-1, 0], '11/13/2014', '11/14/2014', TIMEZONE_OFFSET_1H);
        });
    });

    describe('getGranularityPresets', () => {
        function expectPreset(name, granularity, interval) {
            const preset = getGranularityPresets(name);

            expect(preset.interval).to.eql(interval);
            expect(preset.granularity).to.eql(granularity);
        }

        it('should get valid preset for this year', () => {
            expectPreset(PresetNames.THIS_YEAR, GRANULARITY.year, [0, 0]);
        });

        it('should get valid preset for this quarter', () => {
            expectPreset(PresetNames.THIS_QUARTER, GRANULARITY.quarter, [0, 0]);
        });
    });
});

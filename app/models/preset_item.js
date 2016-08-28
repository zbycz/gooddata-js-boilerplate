import { fromJS, Record, List, Map } from 'immutable';
import { isNumber, isString, findKey } from 'lodash';
import moment from 'moment';

import { GRANULARITY } from './granularity';
import { t } from '../utils/translations';
import { indexBy } from '../utils/immutable';
import * as PresetNames from '../constants/presets';

const presets = [
    { name: PresetNames.ALL_TIME },
    { header: PresetNames.DAY },
    { granularity: GRANULARITY.date, interval: [-6, 0], name: PresetNames.LAST_7_DAYS },
    { granularity: GRANULARITY.date, interval: [-29, 0], name: PresetNames.LAST_30_DAYS },
    { granularity: GRANULARITY.date, interval: [-89, 0], name: PresetNames.LAST_90_DAYS },
    { header: PresetNames.MONTH },
    { granularity: GRANULARITY.month, interval: [0, 0], name: PresetNames.THIS_MONTH },
    { granularity: GRANULARITY.month, interval: [-1, -1], name: PresetNames.LAST_MONTH },
    { granularity: GRANULARITY.month, interval: [-11, 0], name: PresetNames.LAST_12_MONTHS },
    { header: PresetNames.QUARTER },
    { granularity: GRANULARITY.quarter, interval: [0, 0], name: PresetNames.THIS_QUARTER },
    { granularity: GRANULARITY.quarter, interval: [-1, -1], name: PresetNames.LAST_QUARTER },
    { granularity: GRANULARITY.quarter, interval: [-3, 0], name: PresetNames.LAST_4_QUARTERS },
    { header: PresetNames.YEAR },
    { granularity: GRANULARITY.year, interval: [0, 0], name: PresetNames.THIS_YEAR },
    { granularity: GRANULARITY.year, interval: [-1, -1], name: PresetNames.LAST_YEAR }
];

const momentConfigs = {
    [GRANULARITY.date]: { abbrev: 'd', fullName: 'day', format: 'MMM D, YYYY' },
    [GRANULARITY.month]: { abbrev: 'M', fullName: 'month', format: 'MMM YYYY' },
    [GRANULARITY.quarter]: { abbrev: 'Q', fullName: 'quarter', format: '[Q]Q YYYY' },
    [GRANULARITY.year]: { abbrev: 'y', fullName: 'year', format: 'YYYY' }
};

const basePresetItem = {
    header: null,
    name: null,
    granularity: null,
    interval: null,
    today: undefined
};

export function presetItem(options) {
    return fromJS({ ...basePresetItem, ...options });
}

function getInterval(preset) {
    let interval = preset.get('interval') || List(),
        first = interval.get(0),
        second = interval.get(1),
        isFloating = isNumber(first),
        isStatic = isString(first),
        isSingle = first === second,
        isRange = first !== second;

    return { isFloating, isStatic, isSingle, isRange };
}

function getTemplate(preset) {
    const header = preset.get('header');
    if (header) {
        return header;
    }

    const interval = preset.get('interval');
    if (!interval) return 'date.title.allTime';

    if (preset.get('isStatic')) {
        const range = preset.get('isRange') ? 'range' : 'single';
        return `date.interval.title.${range}`;
    }

    if (preset.get('isSingle')) {
        const last = interval.get(0) === 0 ? 'this' : 'last';
        return `date.floating.title.single.${last}`;
    }

    return 'date.floating.title.range.last';
}

function getUnitCount(preset) {
    let interval = preset.get('interval') || List();
    if (preset.get('isFloating')) {
        return interval.get(1) - interval.get(0) + 1;
    }
    return 0;
}

function getUnitTitle(preset) {
    const count = preset.get('unitCount');
    const granularity = preset.get('granularity');
    const translationKey = findKey(GRANULARITY, value => value === granularity);

    if (count) {
        return t(`date.${translationKey}`, { count });
    }

    return null;
}

function getUnitConfig(preset) {
    let config = momentConfigs[preset.get('granularity') || GRANULARITY.date];
    return {
        unitAbbrev: config.abbrev,
        unitFullName: config.fullName,
        unitFormat: config.format
    };
}

function getSeleniumClass(preset) {
    return `s-filter-${preset.get('name', 'header')}`;
}

const LOCAL_TIMEZONE_OFFSET = new Date().getTimezoneOffset() * -1000 * 60;

class DecoratedPresetItem extends Record({
    ...basePresetItem,
    original: null,
    isFloating: false,
    isStatic: false,
    isSingle: false,
    isRange: false,
    template: null,
    unitCount: 0,
    unitTitle: null,
    unitAbbrev: null,
    unitFullName: null,
    unitFormat: null,
    period: null,
    formattedPeriod: null,
    title: null,
    pickerInterval: null,
    seleniumClass: null
}) {
    getPeriod(timezoneOffset = 0, localTimezoneOffset = LOCAL_TIMEZONE_OFFSET) {
        const interval = this.get('interval');
        if (!interval) {
            return null;
        }

        if (this.get('isStatic')) {
            return fromJS({ start: moment(interval.get(0)).toDate(), end: moment(interval.get(1)).toDate() });
        }

        const unit = this.get('unitAbbrev');
        const today = this.get('today');
        const calcDate = offset => moment(today)
            .add(timezoneOffset - localTimezoneOffset, 'ms')
            .add(offset, unit)
            .toDate();

        return fromJS({ start: calcDate(interval.get(0)), end: calcDate(interval.get(1)) });
    }


    getFormattedPeriod(timezoneOffset = 0, localTimezoneOffset = LOCAL_TIMEZONE_OFFSET) {
        const period = this.getPeriod(timezoneOffset, localTimezoneOffset);
        if (!period) {
            return null;
        }

        const format = this.get('unitFormat');
        const calcFormat = date => moment(date).format(format);

        return fromJS({ start: calcFormat(period.get('start')), end: calcFormat(period.get('end')) });
    }

    getTitle(timezoneOffset = 0, localTimezoneOffset = LOCAL_TIMEZONE_OFFSET) {
        const template = this.get('template');
        const formattedPeriod = this.getFormattedPeriod(timezoneOffset, localTimezoneOffset) || Map();

        return template && t(template, {
            unitCount: this.get('unitCount'),
            unitTitle: this.get('unitTitle'),
            periodStart: formattedPeriod.get('start'),
            periodEnd: formattedPeriod.get('end')
        });
    }

    getPickerInterval(timezoneOffset = 0, localTimezoneOffset = LOCAL_TIMEZONE_OFFSET) {
        const period = this.getPeriod(timezoneOffset, localTimezoneOffset);
        if (!period) {
            return null;
        }

        const unitFullName = this.get('unitFullName');
        const calcDate = (date, method) => moment(date)[method](unitFullName).toDate();

        return fromJS({ start: calcDate(period.get('start'), 'startOf'), end: calcDate(period.get('end'), 'endOf') });
    }
}

export function decoratedPresetItem(preset) {
    return new DecoratedPresetItem(preset && preset.withMutations(mutable =>
        mutable
            .set('original', preset)
            .merge(getInterval(mutable)) // order of mutations is important!
            .set('template', getTemplate(mutable))
            .set('unitCount', getUnitCount(mutable))
            .set('unitTitle', getUnitTitle(mutable))
            .merge(getUnitConfig(mutable))
            .set('seleniumClass', getSeleniumClass(mutable))
    ));
}

export const PRESETS =
    fromJS(presets).map(preset => decoratedPresetItem(preset));

export const PRESETS_BY_NAME =
    indexBy(PRESETS.filter(preset => preset.get('name')), 'name');

export function getGranularityPresets(name) {
    return presets.find(preset => preset.name === name);
}

export const PRESETS_PURE =
    indexBy(fromJS(presets).filter(preset => preset.get('granularity')), 'name');

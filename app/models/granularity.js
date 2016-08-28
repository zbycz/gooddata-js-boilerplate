import { t } from '../utils/translations';

export const GRANULARITY = {
    date: 'GDC.time.date',
    week: 'GDC.time.week_us',
    month: 'GDC.time.month',
    quarter: 'GDC.time.quarter',
    year: 'GDC.time.year'
};

/* eslint dot-notation: 0 */
export const GRANULARITY_OPTIONS = [
    { dateType: GRANULARITY.date, label: t('day') },
    { dateType: GRANULARITY.week, label: t('week') },
    { dateType: GRANULARITY.month, label: t('month'), recommendationLabel: t('this_month') },
    { dateType: GRANULARITY.quarter, label: t('quarter'), recommendationLabel: t('this_quarter') },
    { dateType: GRANULARITY.year, label: t('year') }
];

import { fromJS } from 'immutable';

import { t } from '../utils/translations';

export const DATE_DATASET_ATTRIBUTE = 'attr.datedataset';

const dateItemBase = {
    identifier: DATE_DATASET_ATTRIBUTE,
    title: 'Date',
    type: 'date',
    summary: t('dashboard.catalogue_item.common_date_description')
};

export function createDateItem(props = {}) {
    return fromJS({ ...dateItemBase, ...props });
}

import { partial, groupBy } from 'lodash';

function getDatasetGroup(userUri, dataset) {
    return (dataset.author === userUri) ? 'user' : 'shared';
}

export function groupDatasets(datasets, userUri) {
    let grouppingFunction = partial(getDatasetGroup, userUri);
    let defaultGroups = { user: [], shared: [] };
    let groupedDatasets = groupBy(datasets, grouppingFunction);

    return { ...defaultGroups, ...groupedDatasets };
}

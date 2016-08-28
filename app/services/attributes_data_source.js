import DataSource from 'data/DataSource';
import { loadMetricAttributes } from '../utils/api';

export default function createDataSource(projectId, mdObject) {
    return new DataSource({
        itemsPerPage: 50,

        requestHandler({ itemsPerPage, page, searchString }, load = loadMetricAttributes) {
            let options = {
                filter: searchString,

                paging: {
                    limit: itemsPerPage,
                    offset: itemsPerPage * page
                }
            };

            return load(projectId, mdObject, options).then(catalog => ({
                items: catalog.catalog,
                totalCount: catalog.totals.available
            }));
        }
    });
}

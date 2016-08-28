import { getProjectId } from '../selectors/bootstrap_selector';
import { currentReportMDObject } from '../selectors/buckets_selector';

export function createReport(state) {
    return {
        projectId: getProjectId(state),
        mdObject: currentReportMDObject(state),
        isEmpty() {
            return this.mdObject.buckets.measures.length === 0 &&
                this.mdObject.buckets.categories.length === 0;
        }
    };
}

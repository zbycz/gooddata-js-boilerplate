import metricFilterSelector from '../metric_filters_selector';
import initialState from '../../reducers/initial_state';

describe('Metric filters selector test', () => {
    it('returns project id', () => {
        const state = initialState
            .mergeIn(['appState'], {
                bootstrapData: {
                    project: { id: 'my project' }
                }
            });
        const { projectId } = metricFilterSelector(state);

        expect(projectId).to.equal('my project');
    });
});

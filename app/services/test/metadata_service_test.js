import { getMetricMDObject } from '../metadata_service';
import { awarenessMetric } from '../../constants/TestMocks';
import { bucketItem } from '../../models/bucket_item';

describe('getMetricMDObject', () => {
    const metricMDObject = {
        buckets: {
            categories: [],
            filters: [],
            measures: [
                {
                    measure: {
                        format: '[>=1000000000]$#,,,.0 B;[<=-1000000000]-$#,,,.0 B;[>=1000000]$#,,.0 ' +
                            'M;[<=-1000000]-$#,,.0 M;[>=1000]$#,.0 K;[<=-1000]-$#,.0 K;$#,##0',
                        measureFilters: [],
                        showInPercent: false,
                        showPoP: false,
                        type: 'metric'
                    }
                }
            ]
        }
    };

    it('should return generated md object for given metric', () => {
        const metric = bucketItem({ ...awarenessMetric, attribute: { type: 'metric' } });

        expect(getMetricMDObject(metric)).to.eql(metricMDObject);
    });

    it('should ignore showInPercent and showPoP', () => {
        const metric = bucketItem({
            ...awarenessMetric,
            attribute: { type: 'metric' },
            showInPercent: true,
            showPoP: true
        });

        expect(getMetricMDObject(metric)).to.eql(metricMDObject);
    });
});

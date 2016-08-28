import translations from '../translations/en';

function createAggregation(functionName, applicableTo = 'fact') {
    const title = translations[`aggregations.title.${functionName}`];

    return { functionName, title, applicableTo };
}

export const AGGREGATION_FUNCTIONS = [
    createAggregation('SUM'),
    createAggregation('AVG'),
    createAggregation('MIN'),
    createAggregation('MAX'),
    createAggregation('MEDIAN'),
    createAggregation('RUNSUM'),
    createAggregation('COUNT', 'attribute')
];

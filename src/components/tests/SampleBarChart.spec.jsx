import React from 'react';
import { shallow } from 'enzyme';
import { AfmComponents } from '@gooddata/react-components';

import SampleBarChart from '../SampleBarChart';

const { BarChart } = AfmComponents;

describe('SampleBarChart', () => {
    it('should render bar chart', () => {
        const wrapper = shallow(<SampleBarChart width={300} height={300} />);
        expect(wrapper.find(BarChart)).toHaveLength(1);
    });
});

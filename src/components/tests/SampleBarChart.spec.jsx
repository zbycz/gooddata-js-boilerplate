import React from 'react';
import { shallow } from 'enzyme';
import { BarChart } from '@gooddata/react-components';

import SampleBarChart from '../SampleBarChart';

describe('SampleBarChart', () => {
    it('should render bar chart', () => {
        const wrapper = shallow(<SampleBarChart width={300} height={300} />);
        expect(wrapper.find(BarChart)).toHaveLength(1);
    });
});

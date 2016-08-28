import React, { Component } from 'react';
import pureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import DraggableFilterItem from './DraggableFilterItem';
import DateFilterItem from './DateFilterItem';

@pureRender
class DateFilterItemContainer extends Component {
    render() {
        return <DraggableFilterItem {...this.props} FilterItem={DateFilterItem} />;
    }
}

export default connect()(DateFilterItemContainer);

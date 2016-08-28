import React, { Component } from 'react';
import pureRender from 'pure-render-decorator';
import { connect } from 'react-redux';

import DraggableFilterItem from './DraggableFilterItem';
import AttributeFilterItem from './AttributeFilterItem';


@pureRender
class AttributeFilterItemContainer extends Component {
    render() {
        return <DraggableFilterItem {...this.props} FilterItem={AttributeFilterItem} />;
    }
}

export default connect()(AttributeFilterItemContainer);

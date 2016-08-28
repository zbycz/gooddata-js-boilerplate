import React, { Component } from 'react';
import { connect } from 'react-redux';
import pureRender from 'pure-render-decorator';
import DragScroller from 'goodstrap/packages/DragScroller/ReactDragScroller';

import '../styles/buckets';

import * as Actions from '../actions/buckets_actions';

import VISUALIZATION_TYPE_OBJECTS from '../models/visualization_type';
import '../styles/visualization_picker';

import VisualizationPicker from '../components/buckets/VisualizationPicker';
import BucketsPanel from '../components/buckets/BucketsPanel';

import { bucketsSelector } from '../selectors/buckets_selector';

import { bindAll } from 'lodash';

@pureRender
class Buckets extends Component {
    static propTypes = {
        buckets: React.PropTypes.object,
        visualizationType: React.PropTypes.string,
        dispatch: React.PropTypes.func
    };

    constructor() {
        super();
        bindAll(this, ['onTypeChanged']);
    }

    onTypeChanged(type) {
        this.props.dispatch(Actions.selectVisualizationType(type));
    }

    render() {
        const { visualizationType, buckets } = this.props;
        return (
            <div className="adi-buckets-panel">
                <VisualizationPicker
                    selected={visualizationType}
                    types={VISUALIZATION_TYPE_OBJECTS}
                    onClick={this.onTypeChanged}
                />

                <DragScroller className="adi-buckets-scroller">
                    <BucketsPanel
                        buckets={buckets}
                        visualizationType={visualizationType}
                    />
                </DragScroller>
            </div>
        );
    }
}

export default connect(bucketsSelector)(Buckets);

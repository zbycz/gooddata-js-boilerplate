import React, { Component } from 'react';

import Buckets from '../containers/Buckets';
import FilterBucket from '../containers/FilterBucket';
import Report from './Report';
import Recommendations from './Recommendations';
import Shortcuts from './Shortcuts';

export default class EditorMain extends Component {

    render() {
        return (
            <div className="adi-editor-main">
                <Buckets />

                <div className="adi-editor-right-container">
                    <FilterBucket />
                    <div className="adi-editor-canvas">
                        <Report />
                        <Recommendations />
                        <Shortcuts />
                    </div>
                </div>
            </div>
        );
    }
}

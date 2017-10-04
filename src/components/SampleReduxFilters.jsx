import React, { Component } from 'react';
import { Visualization, AttributeFilter } from '@gooddata/react-components';
import { FilterSubscriber, FilterPublisher } from '@gooddata/react-redux-components';
import config from '../config.json';
import catalog from '../catalog';

export default class SampleReduxFilter extends Component {
    render() {
        return (
            <div>
                <FilterPublisher id={'tableFilterContext'}>
                    <AttributeFilter projectId={config.projectId} identifier={catalog['Account Region']} />
                </FilterPublisher>

                <div style={{ height: 500 }}>
                    <FilterSubscriber ids={['tableFilterContext']}>
                        <Visualization
                            uri={'/gdc/md/la84vcyhrq8jwbu4wpipw66q2sqeb923/obj/349238'}
                            projectId={config.projectId}
                        />
                    </FilterSubscriber>
                </div>
            </div>
        );
    }
}

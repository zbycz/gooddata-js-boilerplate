import React, { PropTypes, PureComponent } from 'react';
import { AfmComponents } from '@gooddata/react-components';

import catalog from '../catalog';
import { projectId } from '../config.json';

const { Table } = AfmComponents;

export default class SampleTable extends PureComponent {

    static propTypes = {
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired
    }

    constructor(props) {
        super(props);

        this.onLoadingChanged = this.onLoadingChanged.bind(this);
        this.state = {
            isLoading: true
        };
    }

    onLoadingChanged({ isLoading }) {
        this.setState({
            isLoading
        });
    }

    renderLoading() {
        if (this.state.isLoading) {
            return (
                <div className="loading" />
            );
        }
        return null;
    }

    renderTable() {
        return (
            <Table
                onLoadingChanged={this.onLoadingChanged}
                afm={{
                    measures: [
                        {
                            id: 'm1',
                            definition: {
                                baseObject: {
                                    id: catalog['# of Activities'] // eslint-disable-line dot-notation
                                }
                            }
                        }
                    ],
                    attributes: [
                        {
                            id: catalog['Activity Type'],
                            type: 'attribute'
                        }
                    ]
                }}
                projectId={projectId}
                transformation={{
                    measures: [
                        {
                            id: 'm1',
                            title: '# of Activities'
                        }
                    ]
                }}
            />
        );
    }

    render() {
        const { width, height } = this.props;
        return (
            <div style={{ height, width }}>
                {this.renderLoading()}
                {this.renderTable()}
            </div>
        );
    }
}

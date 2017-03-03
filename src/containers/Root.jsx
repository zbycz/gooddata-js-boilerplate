import React, { PureComponent } from 'react';
import { user } from 'gooddata';

import SampleTable from '../components/SampleTable';
import SampleBarChart from '../components/SampleBarChart';

const getAccountPageUri = () => `/account.html?lastUrl=${encodeURIComponent(window.location.href)}`;

export class Root extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            isAuthorized: false
        };
    }

    componentWillMount() {
        user.getAccountInfo()
            .then(
                () => this.setState({ isAuthorized: true }),
                () => window.location.href = getAccountPageUri() // eslint-disable-line no-return-assign
            );
    }

    render() {
        const { isAuthorized } = this.state;
        if (!isAuthorized) {
            return false;
        }

        return (
            <div>
                <SampleTable
                    width={600}
                    height={400}
                />

                <SampleBarChart
                    width={600}
                    height={400}
                />
            </div>
        );
    }
}

export default Root;

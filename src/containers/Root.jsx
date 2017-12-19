import React, { PureComponent } from 'react';
import { user } from 'gooddata';

import SampleTable from '../components/SampleTable';
import SampleBarChart from '../components/SampleBarChart';
import SampleReduxFilters from '../components/SampleReduxFilters';

const getAccountPageUri = () => `/account.html?lastUrl=${encodeURIComponent(window.location.href)}`;

export class Root extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            isAuthorized: false,
            width: 300
        };

        this.resizeToggle = this.resizeToggle.bind(this);
    }

    componentWillMount() {
        user.getAccountInfo()
            .then(
                () => this.setState({ isAuthorized: true }),
                () => window.location.href = getAccountPageUri() // eslint-disable-line no-return-assign
            );
    }

    reflow() {
        window.dispatchEvent(new Event('resize'));
    }

    resizeToggle(){
        this.setState({ width: this.state.width === 800 ? 300 : 800 });
    }

    render() {
        const { isAuthorized, width } = this.state;
        if (!isAuthorized) {
            return false;
        }

        return (
            <div>
                <button onClick={this.reflow}>call reflow</button>
                <button onClick={this.resizeToggle}>toggle size</button>
                Resizable chart:<br />
                <SampleBarChart
                    width={width}
                    height={400}
                />
                ----

                <SampleTable
                    width={600}
                    height={400}
                />

                <SampleBarChart
                    width={600}
                    height={400}
                />

                <SampleReduxFilters />
            </div>
        );
    }
}

export default Root;

import React from 'react';

export default class AggregationSelect extends React.Component {
    static propTypes = {
        className: React.PropTypes.string,
        aggregationFunctions: React.PropTypes.array,
        aggregation: React.PropTypes.string,
        onSelect: React.PropTypes.func
    };

    static defaultProps = {
        aggregationFunctions: [],
        aggregation: null
    };

    render() {
        return (
            <select
                className={this.props.className}
                onChange={e => this.props.onSelect(e.target.value)}
                value={this.props.aggregation}
            >
                {this.props.aggregationFunctions.map((opt, idx) => (
                    <option key={idx} value={opt.functionName}>{opt.title}</option>
                ))}
            </select>
        );
    }
}

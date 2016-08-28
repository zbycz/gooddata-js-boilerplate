import React from 'react';
import { groupBy, noop } from 'lodash';

export default class Select extends React.Component {
    static propTypes = {
        content: React.PropTypes.array,
        value: React.PropTypes.string,
        optionValuePath: React.PropTypes.string,
        optionLabelPath: React.PropTypes.string,
        optionDisabledPath: React.PropTypes.string,
        optionGroupPath: React.PropTypes.string,
        disabled: React.PropTypes.bool,
        onSelect: React.PropTypes.func
    };

    static defaultProps = {
        content: [],
        value: null,
        optionValuePath: 'identifier',
        optionLabelPath: 'title',
        optionDisabledPath: null,
        optionGroupPath: null,
        disabled: false,
        onSelect: noop
    };

    renderOptions(props, options) {
        return (options || props.content).map((opt, idx) => (
            <option
                key={idx}
                value={opt[props.optionValuePath]}
                disabled={opt[props.optionDisabledPath]}
            >
                {opt[props.optionLabelPath]}
            </option>
        ));
    }

    renderContent(props) {
        if (props.optionGroupPath) {
            let groups = groupBy(props.content, props.optionGroupPath);
            return Object.keys(groups).map((name, idx) => (
                <optgroup key={idx} label={name}>
                    {this.renderOptions(props, groups[name])}
                </optgroup>)
            );
        }
        return this.renderOptions(props);
    }

    render() {
        let props = this.props;
        return (
            <select
                className={props.className}
                onChange={e => props.onSelect(e.target.value)}
                value={props.value}
                disabled={props.disabled}
            >
                {this.renderContent(props)}
            </select>
        );
    }
}

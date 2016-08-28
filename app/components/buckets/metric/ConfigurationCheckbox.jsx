import React from 'react';
import classNames from 'classnames';
import pureRender from 'pure-render-decorator';

@pureRender
export default class ConfigurationCheckbox extends React.Component {
    static propTypes = {
        checked: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        label: React.PropTypes.string,
        name: React.PropTypes.string,
        onChange: React.PropTypes.func
    };

    render() {
        let props = this.props;
        return (
            <label className={classNames('checkbox', { 'is-disabled': props.disabled })}>
                <input
                    type="checkbox"
                    name={props.name}
                    className={`s-${props.name}`}
                    checked={props.checked}
                    disabled={props.disabled}
                    onChange={e => props.onChange(e.target.checked)}
                />
                {props.label}
            </label>
        );
    }
}

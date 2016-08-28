import React, { PropTypes } from 'react';

export default class Recommendation extends React.Component {
    static propTypes = {
        type: PropTypes.string.isRequired,
        children: PropTypes.node.isRequired
    };

    render() {
        let type = this.props.type;

        return (
            <div className={`adi-recommendation adi-recommendation-${type} s-recommendation-${type}`}>
                <div className="adi-recommendation-arrow"></div>
                <div className="adi-recommendation-content">
                    <div className="adi-recommendation-ico"></div>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

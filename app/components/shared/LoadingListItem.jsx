import React from 'react';

export default class LoadingListItem extends React.Component {
    render() {
        let style = { height: 28 };

        return (
            <div className="infinite-list-item empty-item" style={style}>&nbsp;</div>
        );
    }
}

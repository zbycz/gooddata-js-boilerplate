import React from 'react';

export default function LoadingList(props) {
    return <div className="filter-items-loading" style={{ height: props.height }} />;
}

LoadingList.propTypes = {
    height: React.PropTypes.number
};

LoadingList.defaultProps = {
    height: 300
};

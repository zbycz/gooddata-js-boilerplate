import React, { Component } from 'react';
import { connect } from 'react-redux';

import DraggableCatalogueListItem from './DraggableCatalogueListItem';


class CatalogueListItemContainer extends Component {
    render() {
        return <DraggableCatalogueListItem {...this.props} />;
    }
}

export default connect()(CatalogueListItemContainer);

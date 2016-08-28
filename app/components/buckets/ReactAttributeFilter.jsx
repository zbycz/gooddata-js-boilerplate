import React, { PropTypes } from 'react';
import pureRender from 'pure-render-decorator';
import { uniqueId } from 'lodash';

import AttributeItem from './AttributeItem';
import ReactInvertableList from 'List/ReactInvertableList';
import LoadingListItem from '../shared/LoadingListItem';
import LoadingList from '../shared/LoadingList';
import NoResultsList from '../shared/NoResultsList';

const ITEM_HEIGHT = 28;
const LIST_WIDTH = 208;
const SEARCHFIELD_HEIGHT = 42;
const LINKS_HEIGHT = 18 + 6;

@pureRender
export default class ReactAttributeFilter extends React.Component {
    static propTypes = {
        filteredItemsCount: PropTypes.number,
        height: PropTypes.number,
        showSearchField: PropTypes.bool,
        isLoading: PropTypes.bool
    };

    getHeight() {
        const { height, showSearchField, isLoading, filteredItemsCount } = this.props;
        return height -
            (showSearchField ? SEARCHFIELD_HEIGHT : 0) -
            (!isLoading && filteredItemsCount ? LINKS_HEIGHT : 0);
    }

    render() {
        return (
            <ReactInvertableList
                {...this.props}
                height={this.getHeight()}
                width={LIST_WIDTH}
                itemHeight={ITEM_HEIGHT}
                getItemKey={item => (item && item.get('uri')) || uniqueId()}
                loadingListItemClass={LoadingListItem}
                isLoadingClass={LoadingList}
                listItemClass={AttributeItem}
                noItemsFoundClass={NoResultsList}
                paging
            />
        );
    }
}

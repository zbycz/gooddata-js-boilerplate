import React, { Component } from 'react';
import {
    renderIntoDocument,
    findRenderedComponentWithType,
    findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';

import { fromJS } from 'immutable';
import { identity, noop } from 'lodash';

import { Pure, Target, dropConfig, mapDispatchToProps } from '../Catalogue';
import CatalogueList from '../../components/catalogue/CatalogueList';
import BucketItem from '../../components/buckets/BucketItem';
import DraggableBucketItem from '../../components/buckets/DraggableBucketItem';
import Trash from '../../components/catalogue/Trash';

import * as ItemTypes from '../../constants/DragItemTypes';
import * as ActionTypes from '../../constants/Actions';
import * as Paths from '../../constants/StatePaths';

import withDragDrop from '../../utils/with_drag_drop_context';
import withIntl from '../../utils/with_intl';
import withRedux from '../../utils/with_redux';
import SimpleDragSource from '../../utils/simple_drag_source';

import initialState from '../../reducers/initial_state';

describe('Catalogue', () => {
    const defaultProps = {
        reportMDObject: fromJS({
            bucketItems: {
                buckets: {}
            }
        }),
        datasets: fromJS([]),
        catalogue: fromJS({
            filters: [{
                name: 'all',
                label: 'catalogue.filter.all',
                types: ['metric', 'attribute', 'fact']
            }, {
                name: 'metrics',
                label: 'catalogue.filter.metrics',
                types: ['metric', 'fact']
            }, {
                name: 'attributes',
                label: 'catalogue.filter.attributes',
                types: ['attribute']
            }],
            activeFilterIndex: 0,
            isPageLoading: false,
            isLoading: false,
            query: '',
            totals: { available: 0, unavailable: 0 }
        }),
        enableCsvUploader: false,
        projectId: 'N/A',
        dispatch: identity,
        connectDropTarget: identity,
        onDropBucketItem: identity,
        isDragging: false,
        isOver: false,

        loadDateDataSetsAndCatalog: noop,
        loadCatalogueItems: noop
    };
    const WrappedCatalogue = withIntl(Pure);

    describe('#isDragging', () => {
        // catalogue would loose scroll position
        it('should keep both CatalogueList and Trash in DOM', () => {
            const props = { isDragging: true };
            const root = renderIntoDocument(
                <WrappedCatalogue {...defaultProps} {...props} />
            );

            const trash = findRenderedComponentWithType(root, Trash);
            const catalogue = findRenderedComponentWithType(root, CatalogueList);

            expect(trash).to.not.equal(null);
            expect(catalogue).to.not.equal(null);
        });

        it('should display trash when dragging bucket item', () => {
            const props = { isDragging: true };
            const root = renderIntoDocument(
                <WrappedCatalogue {...defaultProps} {...props} />
            );

            const catalogue = findRenderedDOMComponentWithClass(root, 'adi-catalogue-panel');
            const trash = findRenderedDOMComponentWithClass(root, 'adi-trash-panel');

            expect(catalogue.className).to.contain('invisible');
            expect(trash.className).to.not.contain('invisible');
        });

        it('should display catalogue when not dragging bucket item', () => {
            const props = { isDragging: false };
            const root = renderIntoDocument(
                <WrappedCatalogue {...defaultProps} {...props} />
            );

            const catalogue = findRenderedDOMComponentWithClass(root, 'adi-catalogue-panel');
            const trash = findRenderedDOMComponentWithClass(root, 'adi-trash-panel');

            expect(catalogue.className).to.not.contain('invisible');
            expect(trash.className).to.contain('invisible');
        });
    });

    describe('#isOver', () => {
        // catalogue would loose scroll position
        it('should add hover class to trash', () => {
            const props = { isDragging: true, isOver: true };
            const root = renderIntoDocument(
                <WrappedCatalogue {...defaultProps} {...props} />
            );

            const trash = findRenderedComponentWithType(root, Trash);

            expect(trash.props.isOver).to.equal(true);
        });
    });

    describe('#drop', () => {
        let dispatch;
        const { drop } = dropConfig;

        beforeEach(() => {
            dispatch = sinon.spy();
        });

        it('should provide onDropBucketItem with item from dragged data', done => {
            const bucketItem = fromJS({ isFilter: false });

            const onDropBucketItem = data => {
                expect(data.bucketItem).to.equal(bucketItem);
                done();
            };

            const monitor = {
                getItem: () => ({ bucketItem })
            };

            drop({ onDropBucketItem, dispatch }, monitor);
        });

        it('should provide onDropFilterItem with item from dragged data', done => {
            const bucketItem = fromJS({});

            const onDropFilterItem = data => {
                expect(data.bucketItem).to.equal(bucketItem);
                done();
            };

            const monitor = {
                getItem: () => ({ bucketItem, from: 'filters' })
            };

            drop({ onDropFilterItem, dispatch }, monitor);
        });

        it('should provide onDropBucketItem with keyName from dragged data', done => {
            const keyName = 'sample_key_name';

            const onDropBucketItem = data => {
                expect(data.keyName).to.equal(keyName);
                done();
            };

            const monitor = {
                getItem: () => ({ keyName, bucketItem: fromJS({ isFilter: false }) })
            };

            drop({ onDropBucketItem, dispatch }, monitor);
        });

        it('should call onDropBucketItem with item from DragSource', done => {
            const bucketItem = fromJS({ success: true });
            const onDropBucketItem = data => {
                expect(data.bucketItem).to.equal(bucketItem);
                done();
            };

            const props = {
                onDropBucketItem
            };

            const WithDropContext = withDragDrop(withIntl(Target));

            const root = renderIntoDocument(
                <WithDropContext {...defaultProps} {...props} />
            );

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleDragSource({ bucketItem });
            const sourceId = registry.addSource(ItemTypes.BUCKET_ITEM, source);
            const bucket = findRenderedComponentWithType(root, Target);
            const targetId = bucket.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);
            backend.simulateDrop();
            backend.simulateEndDrag();
        });
    });

    describe('#mapDispatchToProps', () => {
        it('should return dispatch function', () => {
            const res = mapDispatchToProps(identity);
            expect(res.dispatch).to.equal(identity);
        });

        it('should return onDropBucketItem', () => {
            const res = mapDispatchToProps(identity);
            expect(typeof res.onDropBucketItem).to.equal('function');
        });

        it(`onDropBucketItem should dispatch ${ActionTypes.BUCKETS_DND_ITEM_REMOVE}`, done => {
            const dispatch = thunk => {
                thunk(
                    action => {
                        expect(action.type).to.equal(ActionTypes.BUCKETS_DND_ITEM_REMOVE);
                        done();
                    },
                    () => initialState.setIn(Paths.ITEM_CACHE, fromJS({ 'my_item': {} }))
                );
            };

            const { onDropBucketItem } = mapDispatchToProps(dispatch);

            onDropBucketItem({ bucketItem: fromJS({ attribute: 'my_item' }) });
        });

        it('should pass in bucket item as payload to action', done => {
            const item = fromJS({ attribute: 'my_item' });
            const dispatch = thunk => {
                thunk(
                    action => {
                        expect(action.payload.bucketItem).to.equal(item);
                        expect(action.payload.keyName).to.equal('sample_key');

                        done();
                    },
                    () => initialState.setIn(Paths.ITEM_CACHE, fromJS({ 'my_item': {} }))
                );
            };

            const { onDropBucketItem } = mapDispatchToProps(dispatch);

            onDropBucketItem({ bucketItem: item, keyName: 'sample_key' });
        });
    });

    describe('integration', () => {
        class Root extends Component {
            static propTypes = { children: React.PropTypes.node };
            render() {
                return (
                    <div>
                        {this.props.children}
                    </div>
                );
            }
        }

        const DnDRoot = withDragDrop(
            withRedux(
                withIntl(Root)
            )
        );

        it('should match dnd results from BucketItem to Catalogue', done => {
            const original = fromJS({ attribute: 'item' });

            const item = fromJS({
                type: 'fact',
                attribute: {},
                original
            });
            const keyName = 'sample_key_name';

            const onDropBucketItem = data => {
                expect(data.bucketItem).to.equal(original);

                done();
            };

            const props = {
                dispatch: identity,
                onDropBucketItem
            };

            let source, target;
            const root = renderIntoDocument(
                <DnDRoot>
                    <BucketItem bucketItem={item} keyName={keyName} />
                    <Target ref={t => { target = t; }} {...defaultProps} {...props} />
                </DnDRoot>
            );

            source = findRenderedComponentWithType(root, DraggableBucketItem);
            const backend = root.getManager().getBackend();

            const sourceId = source.getHandlerId();
            const targetId = target.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);
            backend.simulateDrop();
            backend.simulateEndDrag();
        });
    });
});

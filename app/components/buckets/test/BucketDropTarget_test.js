import React, { Component } from 'react';
import { renderIntoDocument, findRenderedComponentWithType, findRenderedDOMComponentWithClass } from 'react-addons-test-utils';
import { fromJS } from 'immutable';
import { identity, noop } from 'lodash';

import translations from '../../../translations/en';
import * as Actions from '../../../constants/Actions';
import * as ItemTypes from '../../../constants/DragItemTypes';

import BubbleHoverTrigger from 'Bubble/ReactBubbleHoverTrigger';
import Bubble from 'Bubble/ReactBubble';

import BucketDropTarget, {
    Pure,
    Target,
    mapDispatchToProps,
    dropConfig
} from '../BucketDropTarget';

import DraggableCatalogueListItem from '../../catalogue/DraggableCatalogueListItem';

import SimpleDragSource from './../../../utils/simple_drag_source';
import withDragDrop from '../../../utils/with_drag_drop_context';
import withIntl from '../../../utils/with_intl';
import withRedux from '../../../utils/with_redux';

import initialState from '../../../reducers/initial_state';


describe('BucketDropTarget', () => {
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
            withIntl(Root)
        );

        it('should match dnd results from CatalogueListItem to BucketDropTarget', done => {
            const dispatch = sinon.spy();

            const catalogueItem = fromJS({
                type: 'fact',
                identifier: 'sample_catalogue_id'
            });

            const bucket = fromJS({
                keyName: 'metrics',
                accepts: ['fact'],
                items: []
            });

            const handleDrop = data => {
                expect(data.keyName).to.equal('metrics');
                expect(data.catalogueItem.get('identifier')).to.equal('sample_catalogue_id');

                done();
            };

            const root = renderIntoDocument(
                <DnDRoot>
                    <DraggableCatalogueListItem item={catalogueItem} dispatch={dispatch} />
                    <Target
                        bucket={bucket}
                        onCatalogueItemDropped={handleDrop}
                        onFilterItemDropped={noop}
                        onItemSwapped={noop}
                    />
                </DnDRoot>
            );

            const backend = root.getManager().getBackend();

            const source = findRenderedComponentWithType(root, DraggableCatalogueListItem);
            const sourceId = source.getHandlerId();
            const target = findRenderedComponentWithType(root, Target);
            const targetId = target.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);
            backend.simulateDrop();
            backend.simulateEndDrag();

            expect(dispatch.args.length).to.eql(1);
            const message = dispatch.args[0][0];
            expect(message.type).to.eql('DND_ITEM_DRAG_BEGIN');
        });
    });

    describe('#drop', () => {
        const defaultProps = {
            bucket: fromJS({ keyName: 'stacks', items: [], accepts: ['fact'] }),

            onCatalogueItemDropped: noop,
            onFilterItemDropped: noop,
            onItemSwapped: noop
        };

        it('should call onCatalogueItemDropped with dragged data from dropped element in catalogueItem', done => {
            const handleDrop = ({ catalogueItem }) => {
                expect(catalogueItem).to.eql(fromJS({ type: 'fact' }));
                done();
            };

            const WithDropContext = withDragDrop(withIntl(Target));

            const root = renderIntoDocument(
                <WithDropContext
                    {...defaultProps}
                    onCatalogueItemDropped={handleDrop}
                />
            );

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleDragSource({ item: fromJS({ type: 'fact' }) });
            const sourceId = registry.addSource(ItemTypes.CATALOGUE_LIST_ITEM, source);

            const bucket = findRenderedComponentWithType(root, Target);
            const targetId = bucket.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);
            backend.simulateDrop();
            backend.simulateEndDrag();
        });

        it('should call onFilterItemDropped with dragged data from dropped element in catalogueItem', done => {
            const handleDrop = ({ catalogueItem }) => {
                expect(catalogueItem).to.eql(fromJS({ type: 'attribute' }));
                done();
            };

            const WithDropContext = withDragDrop(withIntl(Target));

            const props = {
                bucket: fromJS({ keyName: 'filters', items: [], accepts: ['attribute'] })
            };

            const root = renderIntoDocument(
                <WithDropContext
                    {...props}
                    onFilterItemDropped={handleDrop}
                />
            );

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleDragSource({ item: fromJS({ type: 'attribute' }) });
            const sourceId = registry.addSource(ItemTypes.CATALOGUE_LIST_ITEM, source);

            const bucket = findRenderedComponentWithType(root, Target);
            const targetId = bucket.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);
            backend.simulateDrop();
            backend.simulateEndDrag();
        });

        it('should call onItemSwapped with dragged data from dropped element in bucketItem', done => {
            const fromItem = fromJS({
                attribute: 'from'
            });
            const handleDrop = ({ from, keyName }) => {
                expect(from).to.equal(fromItem);
                expect(keyName).to.equal(defaultProps.bucket.get('keyName'));

                done();
            };

            const WithDropContext = withDragDrop(withIntl(Target));

            const root = renderIntoDocument(
                <WithDropContext
                    {...defaultProps}
                    onItemSwapped={handleDrop}
                />
            );

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleDragSource({ bucketItem: fromItem });
            const sourceId = registry.addSource(ItemTypes.BUCKET_ITEM, source);

            const bucket = findRenderedComponentWithType(root, Target);
            const targetId = bucket.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);
            backend.simulateDrop();
            backend.simulateEndDrag();
        });

        it('should use provided onCatalogueDropped with dropped data', done => {
            const handleDrop = (state, { type, payload }) => {
                if (type !== Actions.BUCKETS_DND_ITEM_INSERT) return state;

                expect(payload.catalogueItem).to.eql(fromJS({ type: 'fact' }));
                done();

                return null;
            };

            const Dnd = withDragDrop(
                withIntl(BucketDropTarget)
            );
            const Wrapped = withRedux(
                Dnd, handleDrop
            );

            const container = renderIntoDocument(
                <Wrapped {...defaultProps} />
            );

            const root = findRenderedComponentWithType(container, Dnd);

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleDragSource({ item: fromJS({ type: 'fact' }) });
            const sourceId = registry.addSource(ItemTypes.CATALOGUE_LIST_ITEM, source);

            const bucket = findRenderedComponentWithType(root, Target);
            const targetId = bucket.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);
            backend.simulateDrop();
            backend.simulateEndDrag();
        });

        it('should provide bucket keyName to onCatalogueDropped', done => {
            const handleDrop = (state, { type, payload }) => {
                if (type !== Actions.BUCKETS_DND_ITEM_INSERT) return state;

                expect(payload.keyName).to.eql('stacks');
                done();

                return null;
            };

            const Dnd = withDragDrop(
                withIntl(BucketDropTarget)
            );
            const Wrapped = withRedux(
                Dnd, handleDrop
            );

            const container = renderIntoDocument(
                <Wrapped {...defaultProps} />
            );

            const root = findRenderedComponentWithType(container, Dnd);

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleDragSource({ item: fromJS({ type: 'fact' }) });
            const sourceId = registry.addSource(ItemTypes.CATALOGUE_LIST_ITEM, source);

            const bucket = findRenderedComponentWithType(root, Target);
            const targetId = bucket.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);
            backend.simulateDrop();
            backend.simulateEndDrag();
        });
    });

    describe('#acceptsDraggedObject', () => {
        const defaultProps = {
            bucket: fromJS({ keyName: 'stacks', items: [], accepts: ['fact'] }),

            onCatalogueItemDropped: noop,
            onFilterItemDropped: noop,
            onItemSwapped: noop
        };

        it('should render drop here message', () => {
            const WithDropContext = withDragDrop(withIntl(Target));

            const root = renderIntoDocument(
                <WithDropContext
                    {...defaultProps}
                    onCatalogueItemDropped={identity}
                />
            );

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleDragSource({ item: fromJS({ type: 'fact' }) });
            const sourceId = registry.addSource(ItemTypes.CATALOGUE_LIST_ITEM, source);

            backend.simulateBeginDrag([sourceId]);

            const invitation = findRenderedDOMComponentWithClass(root, 'adi-bucket-invitation-inner');
            expect(invitation.innerText).to.equal(translations['dashboard.bucket.drop']);

            backend.simulateEndDrag();
        });
        it('should render add adi-droppable-active class', () => {
            const WithDropContext = withDragDrop(withIntl(Target));

            const root = renderIntoDocument(
                <WithDropContext
                    {...defaultProps}
                    onCatalogueItemDropped={identity}
                />
            );

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleDragSource({ item: fromJS({ type: 'fact' }) });
            const sourceId = registry.addSource(ItemTypes.CATALOGUE_LIST_ITEM, source);

            backend.simulateBeginDrag([sourceId]);

            const dropZone = findRenderedDOMComponentWithClass(root, 's-bucket-dropzone');
            expect(dropZone.className).to.contain('adi-droppable-active');

            backend.simulateEndDrag();
        });
    });

    describe('#isOver', () => {
        const defaultProps = {
            bucket: fromJS({ keyName: 'stacks', items: [], accepts: ['fact'] }),

            onCatalogueItemDropped: noop,
            onFilterItemDropped: noop,
            onItemSwapped: noop
        };

        it('should add hover class', () => {
            const WithDropContext = withDragDrop(withIntl(Target));

            const root = renderIntoDocument(
                <WithDropContext {...defaultProps} onCatalogueItemDropped={identity} />
            );

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleDragSource({ item: fromJS({ type: 'fact' }) });
            const sourceId = registry.addSource(ItemTypes.CATALOGUE_LIST_ITEM, source);

            const bucket = findRenderedComponentWithType(root, Target);
            const targetId = bucket.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);

            const dropZone = findRenderedDOMComponentWithClass(root, 's-bucket-dropzone');

            expect(dropZone.className).to.contain('adi-droppable-hover');

            backend.simulateEndDrag();
        });

        it('should not add hover class when not acceptsDraggedObject', () => {
            const WithDropContext = withDragDrop(withIntl(Target));

            const root = renderIntoDocument(
                <WithDropContext {...defaultProps} onCatalogueItemDropped={identity} itemIsAllowedToDrop={() => false} />
            );

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleDragSource({ item: fromJS({ type: 'date' }) });
            const sourceId = registry.addSource(ItemTypes.CATALOGUE_LIST_ITEM, source);

            const bucket = findRenderedComponentWithType(root, Target);
            const targetId = bucket.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);

            const dropZone = findRenderedDOMComponentWithClass(root, 's-bucket-dropzone');

            expect(dropZone.className).to.not.contain('adi-droppable-hover');

            backend.simulateEndDrag();
        });
    });

    describe('#canDrop', () => {
        const { canDrop } = dropConfig;
        const draggedData = { item: fromJS({ type: 'fact' }) };
        const monitor = {
            getItem: () => draggedData
        };

        it('should execute evaluator and return its result', () => {
            const allowedToDrop = sinon.stub().returns(false);
            const res = canDrop({ itemIsAllowedToDrop: allowedToDrop }, monitor);

            expect(res).to.equal(false);
            expect(allowedToDrop).calledWith(draggedData);
        });
    });

    describe('#mapDispatchToProps', () => {
        it(`onCatalogueItemDropped should dispatch ${Actions.BUCKETS_DND_ITEM_INSERT}`, done => {
            const dispatch = t => t(
                ({ type }) => {
                    expect(type).to.equal(Actions.BUCKETS_DND_ITEM_INSERT);

                    done();
                },
                () => initialState
            );
            const { onCatalogueItemDropped } = mapDispatchToProps(dispatch);

            onCatalogueItemDropped({ catalogueItem: fromJS({ type: 'fact' }) });
        });
    });

    describe('#tootip', () => {
        let root;

        function renderComponent(keyName) {
            const Wrapped = withIntl(Pure);

            const defaultProps = {
                bucket: fromJS({ items: [], accepts: ['fact'], keyName }),
                onCatalogueItemDropped: identity,
                onFilterItemDropped: noop,
                onItemSwapped: noop,
                connectDropTarget: identity
            };
            root = renderIntoDocument(
                <Wrapped {...defaultProps} />
            );
        }

        it('bucket with keyName \'filters\' should be align bottom center top center', () => {
            renderComponent('filters');
            const bubbleControl = findRenderedComponentWithType(root, BubbleHoverTrigger);
            bubbleControl.setState({ isBubbleVisible: true });
            const bubble = findRenderedComponentWithType(bubbleControl, Bubble);
            expect(bubble.props.alignPoints[0].align).to.equal('bc tc');
        });

        it('any other bucket with \'keyName\' different of filters should be align center right center left', () => {
            renderComponent('stacks');
            const bubbleControl = findRenderedComponentWithType(root, BubbleHoverTrigger);
            bubbleControl.setState({ isBubbleVisible: true });
            const bubble = findRenderedComponentWithType(bubbleControl, Bubble);
            expect(bubble.props.alignPoints[0].align).to.equal('cr cl');
        });
    });
});

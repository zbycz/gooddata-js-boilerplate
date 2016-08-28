import React from 'react';
import {
    renderIntoDocument,
    findRenderedComponentWithType,
    findRenderedDOMComponentWithClass,
    scryRenderedDOMComponentsWithClass
} from 'react-addons-test-utils';

import { default as Pure } from '../BucketItemPure';

import Source, { dragConfig } from '../DraggableBucketItem';
import Target, { dropConfig } from '../DroppableBucketItem';

import { bucketItem as bucketItemFactory } from '../../../models/bucket_item';
import { decoratedBucket } from '../../../models/bucket';
import { mapDispatchToProps } from '../BucketItem';
import { fromJS } from 'immutable';

import * as ItemTypes from '../../../constants/DragItemTypes';

import withDragDrop from '../../../utils/with_drag_drop_context';
import withIntl from '../../../utils/with_intl';
import withRedux from '../../../utils/with_redux';

import SimpleTarget from '../../../utils/simple_drop_target';
import SimpleSource from '../../../utils/simple_drag_source';

import * as Actions from '../../../constants/Actions';
import initialState from '../../../reducers/initial_state';


describe('BucketItem', () => {
    describe('Component', () => {
        let bucket, items;

        const Wrapped = withRedux(withDragDrop(withIntl(Pure)));

        function render(_item) {
            return renderIntoDocument(
                <Wrapped bucketItem={_item} />
            );
        }

        beforeEach(() => {
            items = fromJS({
                'fact.spend_analysis.cart_additions': {
                    id: 'fact.spend_analysis.cart_additions',
                    identifier: 'fact.spend_analysis.cart_additions',
                    isAvailable: true,
                    summary: '',
                    title: 'Cart Additions',
                    type: 'fact',
                    uri: '/gdc/md/TeamOneGoodSales1/obj/15418'
                },
                'aaeFKXFYiCc0': {
                    expression: 'SELECT SUM([/gdc/md/TeamOneGoodSales1/obj/15417])',
                    format: '[>=1000000000]$#,,,.0 B;[<=-1000000000]-$#,,,.0 B;[>=1000000]$#,,.0 M;[<=-1000000]-$#,,.0 M;[>=1000]$#,.0 K;[<=-1000]-$#,.0 K;$#,##0',
                    id: 'aaeFKXFYiCc0',
                    identifier: 'aaeFKXFYiCc0',
                    isAvailable: true,
                    summary: '',
                    title: 'Awareness',
                    type: 'metric',
                    uri: '/gdc/md/TeamOneGoodSales1/obj/16212'
                }
            });

            bucket = decoratedBucket(fromJS({
                keyName: 'categories', items: [
                    bucketItemFactory({ attribute: 'aaeFKXFYiCc0' }),
                    bucketItemFactory({ attribute: 'fact.spend_analysis.cart_additions' })
                ]
            }), items)
                .setIn(['items', 0, 'isMetric'], true);
        });

        it('renders metric as expandable', () => {
            let config = render(bucket.getIn(['items', 0]));
            findRenderedDOMComponentWithClass(config, 'collapsed');
        });

        it('renders non-metric as non-expandable', () => {
            let config = render(bucket.getIn(['items', 1]));
            expect(scryRenderedDOMComponentsWithClass(config, 'collapsed').length).to.equal(0);
        });
    });

    describe('#beginDrag', () => {
        const Wrapped = withDragDrop(withIntl(Source));

        it('should return original bucketItem from props as drag data', () => {
            const original = fromJS({ attribute: 'item' });
            const bucketItem = fromJS({ original });

            const res = dragConfig.beginDrag({ bucketItem });

            expect(res.bucketItem).to.equal(original);
        });

        it('should pass bucketItem from props as drag data [simulated dnd]', done => {
            const original = fromJS({ attribute: 'item' });

            const bucketItem = fromJS({
                success: true,
                type: 'fact',
                attribute: {},
                original
            });
            const onDrop = data => {
                expect(data.bucketItem).to.eql(original);
                done();
            };

            const root = renderIntoDocument(<Wrapped bucketItem={bucketItem} />);
            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const target = new SimpleTarget(onDrop);
            const targetId = registry.addTarget(ItemTypes.BUCKET_ITEM, target);

            const source = findRenderedComponentWithType(root, Source);
            const sourceId = source.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);
            backend.simulateDrop();
            backend.simulateEndDrag();
        });
    });

    describe('#drop', () => {
        const original = fromJS({ attribute: 'id' });
        const defaultProps = {
            keyName: 'key_name',
            bucketItem: fromJS({
                type: 'fact',
                attribute: {},
                original
            }),
            accepts: fromJS(['fact'])
        };
        const catalogueItem = fromJS({ type: 'fact' });
        const Wrapped = withDragDrop(withIntl(Target));

        const { drop } = dropConfig;

        it('should call onCatalogueItemDropped with bucketItem and dragged catalogue bucketItem', done => {
            const monitor = {
                getItem() {
                    return { item: catalogueItem };
                },
                getItemType() {
                    return ItemTypes.CATALOGUE_LIST_ITEM;
                }
            };
            const onCatalogueItemDropped = data => {
                expect(data.bucketItem).to.equal(original);
                expect(data.catalogueItem).to.equal(catalogueItem);
                expect(data.keyName).to.equal(defaultProps.keyName);

                done();
            };

            drop({ ...defaultProps, onCatalogueItemDropped }, monitor);
        });

        it('should call onItemSwapped with bucketItem on drop of bucketItem', done => {
            const bucketItem = fromJS({
                attribute: 'aaa'
            });
            const bucket = fromJS({ keyName: '' });
            const monitor = {
                getItem() {
                    return { bucketItem };
                },
                getItemType() {
                    return ItemTypes.BUCKET_ITEM;
                }
            };
            const onItemSwapped = data => {
                expect(data.from).to.equal(bucketItem);
                expect(data.to).to.equal(original);

                done();
            };

            drop({ ...defaultProps, onItemSwapped, bucket }, monitor);
        });


        it('should be connected to the component', done => {
            const handleDrop = data => {
                expect(data.bucketItem).to.equal(original);
                expect(data.catalogueItem).to.equal(catalogueItem);
                expect(data.keyName).to.equal(defaultProps.keyName);

                done();
            };
            const root = renderIntoDocument(
                <Wrapped {...defaultProps} onCatalogueItemDropped={handleDrop} />
            );

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleSource({ item: catalogueItem });
            const sourceId = registry.addSource(ItemTypes.CATALOGUE_LIST_ITEM, source);

            const bucket = findRenderedComponentWithType(root, Target);
            const targetId = bucket.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);
            backend.simulateDrop();
            backend.simulateEndDrag();
        });
    });

    describe('#canDrop', () => {
        const { canDrop } = dropConfig;

        it('should pass in dragged item and bucket item', () => {
            const draggedItem = { item: fromJS({ type: 'fact' }) };
            const currentBucketItem = fromJS({ original: {} });
            const monitor = {
                getItem() {
                    return draggedItem;
                }
            };

            const isAllowedToReplace = sinon.stub().returns(false);
            const res = canDrop({
                itemIsAllowedToDrop: isAllowedToReplace,
                bucketItem: currentBucketItem
            }, monitor);

            expect(res).to.equal(false);
            expect(isAllowedToReplace).calledWith({
                item: draggedItem.item,
                bucketItem: currentBucketItem
            });
        });
    });

    describe('#isBeingReplaced', () => {
        const BUCKET_ITEM_CLASS = 's-bucket-item';

        const defaultProps = {
            keyName: 'key_name',
            bucketItem: fromJS({
                type: 'fact',
                attribute: {}
            }),
            accepts: fromJS(['fact'])
        };

        const Wrapped = withDragDrop(withIntl(Target.DecoratedComponent));

        it('should have adi-replace-invitation class', () => {
            const root = renderIntoDocument(
                <Wrapped {...defaultProps} isBeingReplaced />
            );
            const replaceable = findRenderedDOMComponentWithClass(root, BUCKET_ITEM_CLASS);

            expect(replaceable.className).to.contain('adi-replace-invitation');
        });

        it('should have adi-droppable-active class', () => {
            const root = renderIntoDocument(
                <Wrapped {...defaultProps} isBeingReplaced />
            );
            const replaceable = findRenderedDOMComponentWithClass(root, BUCKET_ITEM_CLASS);

            expect(replaceable.className).to.contain('adi-droppable-active');
        });

        it('should not have adi-replace-invitation class', () => {
            const root = renderIntoDocument(
                <Wrapped {...defaultProps} />
            );
            const replaceable = findRenderedDOMComponentWithClass(root, BUCKET_ITEM_CLASS);

            expect(replaceable.className).to.not.contain('adi-replace-invitation');
        });

        it('should not have adi-droppable-active class', () => {
            const root = renderIntoDocument(
                <Wrapped {...defaultProps} />
            );
            const replaceable = findRenderedDOMComponentWithClass(root, BUCKET_ITEM_CLASS);

            expect(replaceable.className).to.not.contain('adi-droppable-active');
        });

        it('should properly add/remove adi-replace-invitation & adi-droppable-active class [simulated dnd]', () => {
            const WithDropContext = withDragDrop(withIntl(Target));

            const root = renderIntoDocument(
                <WithDropContext {...defaultProps} />
            );

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleSource({ bucketItem: fromJS({ type: 'fact' }) });
            const sourceId = registry.addSource(ItemTypes.CATALOGUE_LIST_ITEM, source);

            backend.simulateBeginDrag([sourceId]);

            const replaceable = findRenderedDOMComponentWithClass(root, BUCKET_ITEM_CLASS);
            expect(replaceable.className).to.contain('adi-replace-invitation');
            expect(replaceable.className).to.contain('adi-droppable-active');

            backend.simulateEndDrag();

            expect(replaceable.className).to.not.contain('adi-replace-invitation');
            expect(replaceable.className).to.not.contain('adi-droppable-active');
        });
    });

    describe('#isOver', () => {
        const BUCKET_ITEM_CLASS = 's-bucket-item';

        const defaultProps = {
            keyName: 'key_name',
            bucketItem: fromJS({
                type: 'fact',
                attribute: {}
            }),
            accepts: fromJS(['fact'])
        };

        const Wrapped = withDragDrop(withIntl(Target.DecoratedComponent));

        it('should have adi-droppable-hover class', () => {
            const root = renderIntoDocument(
                <Wrapped {...defaultProps} isBeingReplaced isOver />
            );
            const replaceable = findRenderedDOMComponentWithClass(root, BUCKET_ITEM_CLASS);

            expect(replaceable.className).to.contain('adi-droppable-hover');
        });

        it('should not have adi-droppable-hover class', () => {
            const root = renderIntoDocument(
                <Wrapped {...defaultProps} isOver />
            );
            const replaceable = findRenderedDOMComponentWithClass(root, BUCKET_ITEM_CLASS);

            expect(replaceable.className).to.not.contain('adi-droppable-hover');
        });

        it('should properly add/remove adi-droppable-hover class [simulated dnd]', () => {
            const WithDropContext = withDragDrop(withIntl(Target));

            const root = renderIntoDocument(
                <WithDropContext {...defaultProps} />
            );

            const backend = root.getManager().getBackend();
            const registry = root.getManager().getRegistry();

            const source = new SimpleSource({ bucketItem: fromJS({ type: 'fact' }) });
            const sourceId = registry.addSource(ItemTypes.CATALOGUE_LIST_ITEM, source);

            const bucket = findRenderedComponentWithType(root, Target);
            const targetId = bucket.getHandlerId();

            backend.simulateBeginDrag([sourceId]);
            backend.simulateHover([targetId]);

            const replaceable = findRenderedDOMComponentWithClass(root, BUCKET_ITEM_CLASS);
            expect(replaceable.className).to.contain('adi-droppable-hover');

            backend.simulateEndDrag();

            expect(replaceable.className).to.not.contain('adi-droppable-hover');
        });
    });

    describe('#mapDispatchToProps', () => {
        it(`onCatalogueItemDropped should dispatch ${Actions.BUCKETS_DND_ITEM_REPLACE}`, done => {
            const dispatch = t => t(
                ({ type }) => {
                    expect(type).to.equal(Actions.BUCKETS_DND_ITEM_REPLACE);
                    done();
                },
                () => initialState

            );
            const { onCatalogueItemDropped } = mapDispatchToProps(dispatch);

            onCatalogueItemDropped({ catalogueItem: fromJS({ type: 'fact' }) });
        });
    });
});

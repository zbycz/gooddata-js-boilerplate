import { fromJS } from 'immutable';

import { getConditionDefinition } from '../filter_definition';
import { attributeElement, decoratedAttributeElement } from '../attribute_element';


describe('Filter definitions', () => {
    describe('#getWhereDefinition', () => {
        it('should return null when no filtered items', () => {
            const filter = fromJS({
                attribute: 'attribute',
                isInverted: false,
                selectedElements: []
            });

            const res = getConditionDefinition(filter);

            expect(res).to.equal(null);
        });

        it('should return $in for not inverted filters', () => {
            const filter = fromJS({
                attribute: 'attribute',
                isInverted: false,
                selectedElements: [decoratedAttributeElement(attributeElement({ uri: '?id=1' }))]
            });

            const res = getConditionDefinition(filter);

            expect(res.$in).to.not.equal(undefined);
        });

        it('should return $not.$in for not inverted filters', () => {
            const filter = fromJS({
                attribute: 'attribute',
                isInverted: true,
                selectedElements: [decoratedAttributeElement(attributeElement({ uri: '?id=1' }))]
            });

            const res = getConditionDefinition(filter);

            expect(res.$not.$in).to.not.equal(undefined);
        });

        it('should extract ids from selectedElements', () => {
            const filter = fromJS({
                attribute: 'attribute',
                isInverted: false,
                selectedElements: [
                    decoratedAttributeElement(
                        attributeElement({
                            uri: '/gdc/md/p59vq39f5zc9r16yevfxv62jso8fuu87/obj/15345/elements?id=3977'
                        })
                    )
                ]
            });

            const res = getConditionDefinition(filter);

            expect(res.$in[0].id).to.equal(3977);
        });

        it('should skip items without parsed ids', () => {
            const filter = fromJS({
                attribute: 'attribute',
                isInverted: false,
                selectedElements: [
                    decoratedAttributeElement(attributeElement({ uri: '3977' })),
                    decoratedAttributeElement(attributeElement({ uri: '?id=1' }))
                ]
            });

            const res = getConditionDefinition(filter);

            expect(res.$in[0].id).to.equal(1);
        });
    });

    describe('#getDateFilterDefinition', () => {
        it('returns expression for relative interval', () => {
            let filter = fromJS({
                attribute: {
                    type: 'date'
                },
                interval: {
                    interval: [-6, 0]
                }
            });

            let result = getConditionDefinition(filter);
            expect(result).to.eql({
                '$between': [-6, 0]
            });
        });

        it('returns expression for absolute interval', () => {
            let filter = fromJS({
                attribute: {
                    type: 'date'
                },
                interval: {
                    interval: ['2016-03-20', '2016-04-20']
                }
            });

            let result = getConditionDefinition(filter);
            expect(result).to.eql({
                '$between': ['2016-03-20', '2016-04-20']
            });
        });

        it('returns null for missing interval in date filter', () => {
            let filter = fromJS({
                attribute: {
                    type: 'date'
                }
            });

            let result = getConditionDefinition(filter);
            expect(result).to.equal(null);
        });
    });
});

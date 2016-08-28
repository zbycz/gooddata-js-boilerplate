import { attributeElement, decoratedAttributeElement } from '../attribute_element';

describe('Attribute Element', () => {
    let element, decorated;

    beforeEach(() => {
        element = attributeElement({ uri: '/abc/?id=123', title: 'my title' });
        decorated = decoratedAttributeElement(element);
    });

    describe('decorated element', () => {
        it('should have correct id', () => {
            expect(decorated.get('id')).to.equal(123);
        });

        it('should set title', () => {
            expect(decorated.get('title')).to.equal('my title');
        });

        it('should set (empty value) as title on empty string', () => {
            element = attributeElement({ uri: '/abc/?id=123', title: '' });
            decorated = decoratedAttributeElement(element);

            expect(decorated.get('title')).to.equal('(empty value)');
        });

        it('should set (empty value) as title on missing value', () => {
            element = attributeElement({ uri: '/abc/?id=123' });
            decorated = decoratedAttributeElement(element);

            expect(decorated.get('title')).to.equal('(empty value)');
        });

        it('should set shortTitle', () => {
            expect(decorated.get('shortTitle')).to.equal('my title');
        });

        it('should crop title in shortTitle', () => {
            element = attributeElement({ uri: '/abc/?id=123', title: 'my very long title' });
            decorated = decoratedAttributeElement(element);

            expect(decorated.get('shortTitle')).to.equal('my very lon…');
        });

        it('should be available by default', () => {
            expect(decorated.get('available')).to.equal(true);
        });

        it('should not be available when available is false', () => {
            element = attributeElement({ uri: '/abc/?id=123', available: false });
            decorated = decoratedAttributeElement(element);

            expect(decorated.get('available')).to.equal(false);
        });
    });
});

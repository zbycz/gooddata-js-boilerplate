import { extractDateDataSetTitle } from '../date_datasets';

describe('extractDateDataSetTitle', () => {
    it('should return full title if no parenthesis group is found', () => {
        const title = extractDateDataSetTitle('foo');
        expect(title).to.eql('foo');
    });

    it('should return contents of the last parenthesis group', () => {
        const title = extractDateDataSetTitle('foo (bar) (baz) (qux)');
        expect(title).to.eql('qux');
    });

    it('should return contents of the last nested parenthesis group', () => {
        const title = extractDateDataSetTitle('foo (bar (also nested)) (baz (qux))');
        expect(title).to.eql('baz (qux)');
    });

    it('should handle unclosed parenthesis group gracefully', () => {
        const title = extractDateDataSetTitle('foo (bar) (baz (qux)');
        expect(title).to.eql('baz (qux)');
    });
});

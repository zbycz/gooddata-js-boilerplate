// Copyright (C) 2007-2016, GoodData(R) Corporation. All rights reserved.
import { fromJS } from 'immutable';
import { getCatalogueItemClassName } from '../CatalogueItem.jsx';

describe('getCatalogueItemClassName', () => {
    it('should return correct class for date', () => {
        const item = fromJS({ type: 'date', identifier: 'foobar' });
        expect(getCatalogueItemClassName(item)).to.eql('s-date');
    });

    it('should return correct class for other item types', () => {
        const item = fromJS({ identifier: 'foobar' });
        expect(getCatalogueItemClassName(item)).to.eql('s-id-foobar');
    });
});

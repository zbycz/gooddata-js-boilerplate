import { fromJS, Map } from 'immutable';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';

import { DateFilter } from '../DateFilter';
import { metricAttributeFilter, decoratedMetricAttributeFilter } from '../../../models/metric_attribute_filter';
import { dateDataSet, decoratedDateDataSets } from '../../../models/date_dataset';
import { DATE_DATASET_ATTRIBUTE } from '../../../models/date_item';

import withIntl from '../../../utils/with_intl';

let {
    renderIntoDocument,
    findRenderedComponentWithType,
    findRenderedDOMComponentWithClass,
    Simulate: {
        click,
        change
    }
} = ReactTestUtils;

describe('DateFilter', () => {
    let onApply, component, filter, dat1, dat2, dateDataSets;

    function render() {
        let Wrapper = withIntl(DateFilter),
            wrapper = renderIntoDocument(
                <Wrapper
                    filter={filter}
                    defaultDialogHeight={200}
                    dateDataSets={dateDataSets}
                    onApply={onApply}
                    intl={{ formatMessage: () => {} }}
                />
            );

        return findRenderedComponentWithType(wrapper, DateFilter);
    }

    beforeEach(() => {
        onApply = sinon.spy();

        dat1 = dateDataSet({ identifier: 'id1', title: 'One' });
        dat2 = dateDataSet({ identifier: 'id2', title: 'Two' });

        dateDataSets = decoratedDateDataSets(fromJS({
            available: [dat1, dat2],
            dateDataSet: dat1,
            unavailable: 0
        }));

        filter = decoratedMetricAttributeFilter(
            metricAttributeFilter({ attribute: DATE_DATASET_ATTRIBUTE }),
            Map(),
            dateDataSets
        );

        component = render();
    });

    afterEach(() => {
        // work-around to handle overlays
        document.body.innerHTML = '';
    });

    function findElement(query) {
        return document.querySelector(query);
    }

    function clickElement(query) {
        click(findElement(query));
    }

    function changeElement(query, value) {
        let input = findElement(query);
        input.value = value;

        change(input);
    }

    describe('actions', () => {
        let button;

        beforeEach(() => {
            button = findRenderedDOMComponentWithClass(component, 'adi-filter-button');
            click(button);
        });

        describe('dropdown', () => {
            it('clicking button should toggle dropdown display', () => {
                expect(findElement('.adi-filter-picker')).to.be.ok();

                click(button);

                expect(findElement('.adi-filter-picker')).to.equal(null);
            });
        });

        describe('select date dataset', () => {
            beforeEach(() => {
                const dropdownButton = findElement('.s-date-dataset-button');
                click(dropdownButton);

                const element = findElement('.s-id2');
                click(element);
            });

            it('should not close dropdown', () => {
                expect(findElement('.adi-filter-picker')).to.be.ok();
            });

            it('should send selected date dataset', () => {
                expect(onApply).calledWith({ dateDataSet: dateDataSets.get('items').get(1) });
            });
        });

        describe('select preset', () => {
            beforeEach(() => {
                clickElement('.s-filter-last_7_days');
            });

            it('should close dropdown', () => {
                expect(findElement('.adi-filter-picker')).to.equal(null);
            });

            it('should select corresponding interval', () => {
                expect(onApply).calledOnce();
                expect(onApply.getCall(0).args[0].interval.get('interval').toJS()).to.eql([-6, 0]);
            });
        });

        describe('enter range', () => {
            beforeEach(() => {
                clickElement('.s-tab-range');

                changeElement('.s-interval-from .input-text', '01/01/2015');
                changeElement('.s-interval-to .input-text', '01/02/2015');

                clickElement('.s-date-range-apply');
            });

            it('should close dropdown', () => {
                expect(findElement('.adi-filter-picker')).to.equal(null);
            });

            it('should select corresponding interval', () => {
                expect(onApply).calledOnce();
                expect(onApply.getCall(0).args[0].interval.toJS()).to.eql({
                    interval: ['2015-01-01', '2015-01-02'],
                    granularity: 'GDC.time.date'
                });
            });
        });

        describe('close', () => {
            beforeEach(() => {
                clickElement('.s-tab-range');
                clickElement('.s-date-range-cancel');
            });

            it('should close the dropdown', () => {
                expect(findElement('.adi-filter-picker')).to.equal(null);
            });

            it('should not call onApply', () => {
                expect(onApply).not.to.be.called();
            });
        });
    });
});

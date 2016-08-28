import { fromJS } from 'immutable';
import initialState from '../../reducers/initial_state';
import * as StatePaths from '../../constants/StatePaths';
import { TABLE, COLUMN } from '../../constants/visualizationTypes';
import {
    saveReportSelector,
    saveAsNewReportSelector
} from '../save_report_selector';

const validReportWithoutChanges = initialState.withMutations(mutableState => {
    mutableState.setIn(StatePaths.REPORT_EXECUTION_DATA, { foo: 'bar' });
    mutableState.setIn(StatePaths.REPORT_CONTENT, fromJS({
        buckets: {
            categories: [],
            filters: [],
            measures: []
        },
        type: COLUMN
    }));
});

const validReportWithChanges = initialState.withMutations(mutableState => {
    mutableState.setIn(StatePaths.VISUALIZATION_TYPE, TABLE);
    mutableState.setIn(StatePaths.REPORT_EXECUTION_DATA, { foo: 'bar' });
    mutableState.setIn(StatePaths.REPORT_CONTENT, fromJS({
        buckets: {
            categories: ['foo'],
            filters: [],
            measures: [],
            stacks: []
        },
        type: TABLE
    }));
});

const reportContent = fromJS({
    buckets: {
        categories: [],
        filters: [],
        measures: []
    },
    type: COLUMN
});

const reportWithChangedTitle = initialState.withMutations(mutableState => {
    mutableState.setIn(StatePaths.VISUALIZATION_TYPE, TABLE);
    mutableState.setIn(StatePaths.REPORT_CURRENT_TITLE, 'updated title');
    mutableState.setIn(StatePaths.REPORT_CONTENT, reportContent);
    mutableState.setIn(StatePaths.REPORT_EXECUTION_DATA, { foo: 'bar' });
});

const reportEmpty = initialState.withMutations(mutableState => {
    mutableState.setIn(StatePaths.VISUALIZATION_TYPE, TABLE);
    mutableState.setIn(StatePaths.REPORT_CURRENT_TITLE, 'updated title');
    mutableState.setIn(StatePaths.REPORT_CONTENT, reportContent);
    mutableState.setIn(StatePaths.REPORT_EXECUTION_DATA, fromJS({
        isEmpty: true
    }));
});

const reportTooLarge = initialState.withMutations(mutableState => {
    mutableState.setIn(StatePaths.VISUALIZATION_TYPE, TABLE);
    mutableState.setIn(StatePaths.REPORT_CURRENT_TITLE, 'updated title');
    mutableState.setIn(StatePaths.REPORT_CONTENT, reportContent);
    mutableState.setIn(StatePaths.REPORT_EXECUTION_ERROR, fromJS({
        status: 413
    }));
});

const reportMissingMetric = initialState.setIn(StatePaths.VISUALIZATION_TYPE, COLUMN);

const savingInProgress = validReportWithoutChanges.setIn(StatePaths.REPORT_SAVING, true);
const savingAsInProgress = validReportWithoutChanges.setIn(StatePaths.REPORT_SAVING_AS_NEW, true);

describe('Save selectors', () => {
    describe('saveReportSelector', () => {
        it('should return isSaving false and isDisabled true when report is not valid and not saving', () => {
            expect(saveReportSelector(initialState)).to.eql({
                isSaving: false,
                isDisabled: true
            });
        });

        it('should return isSaving false and isDisabled true when report is valid but same', () => {
            expect(saveReportSelector(validReportWithoutChanges)).to.eql({
                isSaving: false,
                isDisabled: true
            });
        });

        it('should return isSaving false and isDisabled false when report is valid and different', () => {
            expect(saveReportSelector(validReportWithChanges)).to.eql({
                isSaving: false,
                isDisabled: false
            });
        });

        it('should return isDisabled=false when report the same and title changed', () => {
            expect(saveReportSelector(reportWithChangedTitle)).to.eql({
                isSaving: false,
                isDisabled: false
            });
        });

        it('should be disabled and saving when report is saving', () => {
            expect(saveReportSelector(savingInProgress)).to.eql({
                isSaving: true,
                isDisabled: true
            });
        });

        it('save should be enabled if tooLarge', () => {
            expect(saveReportSelector(reportTooLarge)).to.eql({
                isSaving: false,
                isDisabled: false
            });
        });

        it('save should be enabled if empty', () => {
            expect(saveReportSelector(reportEmpty)).to.eql({
                isSaving: false,
                isDisabled: false
            });
        });

        it('should be disabled and not saving when "save as" is in progress', () => {
            expect(saveReportSelector(savingAsInProgress)).to.eql({
                isSaving: false,
                isDisabled: true
            });
        });

        it('should be disabled if report is missing metric and viz. type is table', () => {
            expect(saveReportSelector(reportMissingMetric)).to.eql({
                isSaving: false,
                isDisabled: true
            });
        });
    });

    describe('saveAsNewReportSelector', () => {
        it('should return isSaving false and isDisabled true when report is not valid and not saving', () => {
            expect(saveAsNewReportSelector(initialState)).to.eql({
                isSaving: false,
                isDisabled: true
            });
        });

        it('should return isSaving false and isDisabled true when report is valid but same', () => {
            expect(saveAsNewReportSelector(validReportWithoutChanges)).to.eql({
                isSaving: false,
                isDisabled: false
            });
        });

        it('should return isSaving false and isDisabled false when report is valid and different', () => {
            expect(saveAsNewReportSelector(validReportWithChanges)).to.eql({
                isSaving: false,
                isDisabled: false
            });
        });

        it('should return isDisabled=false when report the same and title changed', () => {
            expect(saveAsNewReportSelector(reportWithChangedTitle)).to.eql({
                isSaving: false,
                isDisabled: false
            });
        });

        it('should be disabled and saving when report "saving as" is in progress', () => {
            expect(saveAsNewReportSelector(savingAsInProgress)).to.eql({
                isSaving: true,
                isDisabled: true
            });
        });

        it('should be disabled and not saving when "save" is in progress', () => {
            expect(saveAsNewReportSelector(savingInProgress)).to.eql({
                isSaving: false,
                isDisabled: true
            });
        });

        it('"save as" should be enabled if tooLarge', () => {
            expect(saveAsNewReportSelector(reportTooLarge)).to.eql({
                isSaving: false,
                isDisabled: false
            });
        });

        it('"save should" be enabled if empty', () => {
            expect(saveAsNewReportSelector(reportEmpty)).to.eql({
                isSaving: false,
                isDisabled: false
            });
        });

        it('should be disabled if metric is missing', () => {
            expect(saveAsNewReportSelector(reportMissingMetric)).to.eql({
                isSaving: false,
                isDisabled: true
            });
        });
    });
});

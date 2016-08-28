import * as ActionTypes from '../../constants/Actions';
import saveReducer from '../save_reducer';
import { Map, fromJS } from 'immutable';

describe('save_reducer', () => {
    describe(`#${ActionTypes.SAVE_REPORT_STARTED}`, () => {
        it('should set REPORT_SAVING to true if not saving as new', () => {
            const action = {
                type: ActionTypes.SAVE_REPORT_STARTED,
                payload: {
                    saveAsNew: false
                }
            };

            const expectedState = {
                report: {
                    saving: true
                }
            };

            const result = saveReducer(Map(), action);

            expect(result.toJS()).to.eql(expectedState);
        });

        it('should set REPORT_SAVING to true if saving as new', () => {
            const action = {
                type: ActionTypes.SAVE_REPORT_STARTED,
                payload: {
                    saveAsNew: true
                }
            };

            const expectedState = {
                report: {
                    savingAsNew: true
                }
            };

            const result = saveReducer(Map(), action);

            expect(result.toJS()).to.eql(expectedState);
        });
    });

    describe(`#${ActionTypes.SAVE_REPORT_FINISHED}`, () => {
        const reportMDObject = { foo: 'bar' };
        const payload = { reportMDObject: fromJS(reportMDObject) };

        it('should set REPORT_SAVING to false if not saving as new and REPORT_LAST_SAVED_OBJECT to reportMDObject', () => {
            const action = {
                type: ActionTypes.SAVE_REPORT_FINISHED,
                payload: {
                    savingAsNew: false,
                    ...payload
                }
            };

            const expectedState = {
                report: {
                    saving: false,
                    lastSavedObject: reportMDObject
                }
            };

            const result = saveReducer(Map(), action);

            expect(result.toJS()).to.eql(expectedState);
        });

        it('should set REPORT_SAVING_AS_NEW to false if saving as new and REPORT_LAST_SAVED_OBJECT to reportMDObject', () => {
            const action = {
                type: ActionTypes.SAVE_REPORT_FINISHED,
                payload: {
                    saveAsNew: true,
                    ...payload
                }
            };

            const expectedState = {
                report: {
                    savingAsNew: false,
                    lastSavedObject: reportMDObject
                }
            };

            const result = saveReducer(Map(), action);

            expect(result.toJS()).to.eql(expectedState);
        });
    });

    describe(`#${ActionTypes.SAVE_REPORT_ERROR}`, () => {
        it('should set SAVE_REPORT_ERROR to false', () => {
            const action = {
                type: ActionTypes.SAVE_REPORT_ERROR,
                payload: {
                    saveAsNew: false
                }
            };

            const expectedState = {
                report: {
                    saving: false
                }
            };

            const result = saveReducer(Map(), action);

            expect(result.toJS()).to.eql(expectedState);
        });

        it('should set SAVE_REPORT_ERROR to false', () => {
            const action = {
                type: ActionTypes.SAVE_REPORT_ERROR,
                payload: {
                    saveAsNew: true
                }
            };

            const expectedState = {
                report: {
                    savingAsNew: false
                }
            };

            const result = saveReducer(Map(), action);

            expect(result.toJS()).to.eql(expectedState);
        });
    });
});

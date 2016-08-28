import * as ActionTypes from '../../constants/Actions';

import dialogsReducer from '../dialogs_reducer';
import initialState from '../../reducers/initial_state';
import * as StatePaths from '../../constants/StatePaths';
import { fromJS } from 'immutable';

describe('DialogsReducer', () => {
    function setTestDialog(state) {
        return state.setIn(StatePaths.DIALOGS, fromJS({
            openReportConfirmation: {
                active: true,
                data: { foo: 'bar' }
            }
        }));
    }

    describe(`#${ActionTypes.DIALOG_HIDE}`, () => {
        it('should set dialog active flag to false and remove dialog data', () => {
            const stateWithDialog = setTestDialog(initialState);

            const updatedState = dialogsReducer(stateWithDialog, { type: ActionTypes.DIALOG_HIDE });

            const confirmation = updatedState.getIn([...StatePaths.DIALOGS, 'openReportConfirmation']);
            expect(confirmation.toJS()).to.eql({
                active: false,
                data: null
            });
        });
    });

    describe(`#${ActionTypes.OPEN_REPORT_STARTED}`, () => {
        it('should call dialogHide', () => {
            const stateWithDialog = setTestDialog(initialState);

            const updatedState = dialogsReducer(stateWithDialog, { type: ActionTypes.OPEN_REPORT_STARTED });

            const confirmation = updatedState.getIn([...StatePaths.DIALOGS, 'openReportConfirmation']);
            expect(confirmation.toJS()).to.eql({
                active: false,
                data: null
            });
        });
    });

    describe(`#${ActionTypes.SHOW_DIALOG_OPEN_REPORT_CONFIRMATION}`, () => {
        it('should set flags to show open report confirmation dialog', () => {
            const updatedState = dialogsReducer(initialState, { type: ActionTypes.SHOW_DIALOG_OPEN_REPORT_CONFIRMATION, payload: { foo: 'bar' } });

            const confirmation = updatedState.getIn([...StatePaths.DIALOGS, 'openReportConfirmation']);
            expect(confirmation.toJS()).to.eql({
                active: true,
                data: { foo: 'bar' }
            });
        });
    });

    describe(`#${ActionTypes.SHOW_DIALOG_SAVING_UNTITLED_REPORT_CONFIRMATION}`, () => {
        const expectUntitledConfirmation = (state, expected) => {
            const confirmation = state.getIn(StatePaths.DIALOGS_SAVING_UNTITLED_REPORT_CONFIRMATION_ACTIVE);
            expect(confirmation).to.equal(expected);
        };

        it('should not have saving untitled report confirmation flag set by default', () => {
            expectUntitledConfirmation(initialState, false);
        });

        it('should set flags to show saving untitled report confirmation', () => {
            const updatedState = dialogsReducer(initialState, {
                type: ActionTypes.SHOW_DIALOG_SAVING_UNTITLED_REPORT_CONFIRMATION,
                payload: {}
            });

            expectUntitledConfirmation(updatedState, true);
        });
    });
});

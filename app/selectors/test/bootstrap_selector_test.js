import { fromJS } from 'immutable';
import { isCsvUploaderEnabled } from '../bootstrap_selector';
import initialState from '../../reducers/initial_state';
import * as Paths from '../../constants/StatePaths';

describe('Bootstrap selector test', () => {
    let state;

    beforeEach(() => {
        state = initialState
            .mergeDeepIn(Paths.APP_STATE, fromJS({
                bootstrapData: {
                    featureFlags: {
                        enableCsvUploader: true
                    },
                    permissions: {
                        canUploadNonProductionCSV: true
                    }
                },
                meta: {
                    isEmbedded: false
                }
            }));
    });

    describe('isCsvUploaderEnabled', () => {
        it('should be true when csv uploading is enabled and app is not embedded', () => {
            expect(isCsvUploaderEnabled(state)).to.eql(true);
        });

        it('should be false when csv uploading is disabled', () => {
            state = state.setIn([...Paths.FEATURE_FLAGS, 'enableCsvUploader'], false);

            expect(isCsvUploaderEnabled(state)).to.eql(false);
        });

        it('should be false when csv uploading is disabled for project', () => {
            state = state.setIn(
                [...Paths.BOOTSTRAP_DATA_PERMISSIONS, Paths.Permissions.CAN_UPLOAD_NON_PRODUCTION_CSV],
                false
            );

            expect(isCsvUploaderEnabled(state)).to.eql(false);
        });

        it('should be false when app is embedded', () => {
            state = state.setIn(Paths.IS_EMBEDDED, true);

            expect(isCsvUploaderEnabled(state)).to.eql(false);
        });
    });
});

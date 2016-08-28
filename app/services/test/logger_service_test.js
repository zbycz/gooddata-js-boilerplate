import * as LoggerService from '../logger_service';
import * as StatePaths from '../../constants/StatePaths';
import initialState from '../../reducers/initial_state';
import { fromJS } from 'immutable';

describe('logger service', () => {
    describe('GA logging', () => {
        const projectId = '/proj/1';
        const loginMD5 = 'loginmd5';
        const email = 'bear@gooddata.com';
        const emailDomain = 'gooddata.com';
        const organizationName = 'gooddata';
        const projectTemplate = '/goodsales/1';

        const commonDimensions = {
            dimension2: loginMD5,
            dimension3: emailDomain,
            dimension4: organizationName,
            dimension5: projectId,
            dimension9: projectTemplate
        };

        let state;
        let logStub;

        beforeEach(() => {
            state = initialState.setIn(StatePaths.BOOTSTRAP, fromJS({
                project: {
                    id: projectId,
                    template: projectTemplate
                },
                accountSetting: {
                    loginMD5,
                    email
                },
                branding: {
                    organizationName
                }
            }));

            logStub = sinon.stub();
        });

        it('should send log event correctly enriched', () => {
            const action = 'action';
            const label = 'label';
            const value = 'value';

            LoggerService.sendLogEvent(state, { action, label, value }, logStub);

            const callArgs = logStub.getCall(0).args[0];
            expect(callArgs).to.include({
                ...commonDimensions,

                hitType: 'event',
                eventCategory: 'analyticalDesigner',
                eventAction: action,
                eventLabel: label,
                eventValue: value
            });
        });

        it('should log page view correctly enriched', () => {
            const page = '/page';
            const location = 'location';

            LoggerService.sendLogPageView(state, { page, location }, logStub);

            const callArgs = logStub.getCall(0).args[0];
            expect(callArgs).to.include({
                ...commonDimensions,

                hitType: 'pageview',
                title: 'analytical designer',
                page: '/insights/page/',
                location
            });
        });

        it('should log page view correctly when in embedded mode', () => {
            const page = '/page';
            const location = 'location';

            state = state.setIn(StatePaths.IS_EMBEDDED, true);

            LoggerService.sendLogPageView(state, { page, location }, logStub);

            const callArgs = logStub.getCall(0).args[0];
            expect(callArgs).to.include({
                ...commonDimensions,

                hitType: 'pageview',
                title: 'analytical designer',
                page: '/insights-embed/page/',
                location
            });
        });

        it('should skip undefined values when logging page view', () => {
            const title = 'title';
            const page = 'page';

            LoggerService.sendLogPageView(state, { title, page }, logStub);

            const callArgs = logStub.getCall(0).args[0];
            expect(callArgs).not.to.have.keys('location');
        });

        it('should send correct timing', () => {
            const label = 'label';
            const value = 'value';
            const variable = 'variable';

            LoggerService.sendLogTiming(state, { label, value, variable }, logStub);

            const callArgs = logStub.getCall(0).args[0];
            expect(callArgs).to.include({
                hitType: 'timing',
                timingCategory: 'analyticalDesigner',
                timingVar: variable,
                timingValue: value,
                timingLabel: label
            });
        });
    });
});

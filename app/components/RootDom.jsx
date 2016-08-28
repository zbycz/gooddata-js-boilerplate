import React, { Component, PropTypes } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import rootDomSelector from '../selectors/root_dom_selector';
import { bindAll } from 'lodash';
import * as MenuConstants from '../constants/Menu';
import Header from '../../node_modules/goodstrap/packages/Header/ReactHeader';
import Editor from './Editor';
import Messages from './Messages';
import Dialogs from './Dialogs';
import pureRender from 'pure-render-decorator';
import CustomDragLayer from './CustomDragLayer';

import { logoutRequested, projectSelectRequested } from '../actions/app_context_actions';

@pureRender
class RootDom extends Component {
    static propTypes = {
        onLogout: PropTypes.func.isRequired,
        onMenuItemClick: PropTypes.func.isRequired,
        onProjectSelect: PropTypes.func.isRequired,
        intl: PropTypes.object.isRequired,
        profileUri: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        branding: PropTypes.object.isRequired,
        project: PropTypes.object.isRequired,
        menuItems: PropTypes.object.isRequired,
        accountMenuItems: PropTypes.object.isRequired,
        isReportOpening: PropTypes.bool,
        isEmbedded: PropTypes.bool
    };

    static defaultProps = {
        isReportOpening: false,
        isEmbedded: false
    };

    constructor() {
        super();
        bindAll(this, 'getLocalizedMenuItems');
    }

    getLocalizedMenuItems(menuItems) {
        return menuItems.map(menuItem => {
            menuItem.title = this.props.intl.formatMessage({
                id: menuItem[MenuConstants.ITEM_TRANSLATION_KEY]
            });
            return menuItem;
        });
    }

    renderHeader() {
        const { profileUri, branding, menuItems, accountMenuItems, userName, project, isEmbedded } = this.props;

        if (isEmbedded) {
            return null;
        }

        return (
            <Header
                profileUri={profileUri}
                branding={branding.toJS()}
                project={project}
                menuItems={this.getLocalizedMenuItems(menuItems).toJS()}
                accountMenuItems={this.getLocalizedMenuItems(accountMenuItems).toJS()}
                userName={userName}
                onLogout={this.props.onLogout}
                onMenuItemClick={this.props.onMenuItemClick}
                onProjectSelect={this.props.onProjectSelect}
            />
        );
    }

    render() {
        return (
            <div className="app-root">
                <Dialogs />
                <CustomDragLayer />
                <Messages />
                {this.renderHeader()}
                <Editor isReportOpening={this.props.isReportOpening} />
            </div>
        );
    }
}

export function mapDispatchToProps(dispatch) {
    const onLogout = () => {
        dispatch(logoutRequested(window));
    };

    const onProjectSelect = project => {
        dispatch(projectSelectRequested(window, project.hash));
    };

    const onMenuItemClick = item => {
        if (item.key === 'logout') {
            onLogout();
        }
    };

    return {
        onLogout,
        onProjectSelect,
        onMenuItemClick
    };
}

export default connect(rootDomSelector, mapDispatchToProps)(injectIntl(RootDom));

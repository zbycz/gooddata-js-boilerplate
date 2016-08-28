import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';

import RootDom from '../components/RootDom.jsx';
import Error from '../components/Error.jsx';

import { FormattedMessage } from 'react-intl';
import { DragDropContext } from 'react-dnd';
import touchBackend from 'react-dnd-touch-backend';

import { bootstrap, historyStatePopped } from '../actions/app_context_actions';

import AppleTouchIcon from '../../node_modules/goodstrap/packages/core/ReactAppleTouchIcon';
import Favicon from '../../node_modules/goodstrap/packages/core/ReactFavicon';

import rootSelector from '../selectors/root_selector';
import { getRouteParams, getCurrentHash } from '../utils/location';

export class Root extends Component {
    static propTypes = {
        // injected from app.jsx
        projectId: PropTypes.string,
        datasetId: PropTypes.string,

        bootstrap: PropTypes.func.isRequired,
        historyStatePopped: PropTypes.func.isRequired,

        errors: PropTypes.object.isRequired,
        isAppReady: PropTypes.bool.isRequired,
        branding: PropTypes.object,
        pageTitle: PropTypes.string.isRequired,
        appleTouchIconUrl: PropTypes.string,
        faviconUrl: PropTypes.string
    };

    componentWillMount() {
        this.props.bootstrap(window, this.props.projectId, this.props.datasetId);

        this._onStateChangedHandler = this.onStateChanged.bind(this);
        window.addEventListener('popstate', this._onStateChangedHandler);
    }

    componentWillUnmount() {
        if (this._onStateChangedHandler) {
            window.removeEventListener('popstate', this._onStateChangedHandler);
        }
    }

    onStateChanged() {
        const routeParams = getRouteParams(getCurrentHash());
        if (this.props.projectId) {
            this.props.historyStatePopped(window, routeParams);
        }
    }

    renderContent() {
        const { errors, isAppReady } = this.props;
        if (errors.size > 0) {
            return (
                <Error errors={errors} />
            );
        }

        if (isAppReady) {
            return (
                <RootDom />
            );
        }

        return (
            <div className="main-loading">
                <FormattedMessage id="loading" />
            </div>
        );
    }

    render() {
        const { pageTitle, appleTouchIconUrl, faviconUrl } = this.props;
        return (
            <div>
                <DocumentTitle title={pageTitle} />
                <AppleTouchIcon url={appleTouchIconUrl} />
                <Favicon url={faviconUrl} />
                {this.renderContent()}
            </div>
        );
    }
}

const dispatchToProps = {
    bootstrap,
    historyStatePopped
};

export default connect(rootSelector, dispatchToProps)(DragDropContext(
    touchBackend({ enableMouseEvents: true, enableTouchEvents: false })
)(Root));

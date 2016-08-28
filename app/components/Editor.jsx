import React, { Component, PropTypes } from 'react';
import Catalogue from '../containers/Catalogue';
import EditorHeader from './EditorHeader';
import EditorMain from './EditorMain';
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup';

export default class Editor extends Component {
    static propTypes = {
        isReportOpening: PropTypes.bool
    }

    renderMain() {
        return this.props.isReportOpening ? null : <EditorMain key="editor-main" />;
    }

    renderLoading() {
        return this.props.isReportOpening ? <div key="loading" className="editor-loading adi-editor-main" /> : null;
    }

    render() {
        return (
            <div className="adi-editor">
                <EditorHeader />
                <Catalogue />
                <ReactCSSTransitionGroup
                    transitionName="opening-report"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={1}
                >
                    {this.renderMain()}
                </ReactCSSTransitionGroup>
                {this.renderLoading()}
            </div>
        );
    }
}

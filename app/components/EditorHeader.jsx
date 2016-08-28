import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Button from 'Button/ReactButton';
import Bubble from 'Bubble/ReactBubble';
import BubbleHoverTrigger from 'Bubble/ReactBubbleHoverTrigger';
import ExportButton from './shared/ExportButton';
import SaveReportButton from './header/SaveReportButton';
import SaveAsNewReportButton from './header/SaveAsNewReportButton';
import classNames from 'classnames';
import { undo, redo } from '../actions/time_travel_actions';
import VisualizationsDropdown from './header/VisualizationsDropdown';
import editorHeaderSelector from '../selectors/editor_header_selector';
import * as AppContextActions from '../actions/app_context_actions';
import ReportTitle from './ReportTitle';

import { t } from '../utils/translations';

export class EditorHeader extends Component {
    static propTypes = {
        onUndo: PropTypes.func.isRequired,
        onRedo: PropTypes.func.isRequired,
        onResetReport: PropTypes.func.isRequired,
        isUndoDisabled: PropTypes.bool,
        isRedoDisabled: PropTypes.bool,
        isResetDisabled: PropTypes.bool,
        isSaveDisabled: PropTypes.bool,
        isTitleDisabled: PropTypes.bool,
        isReportSaved: PropTypes.bool,
        isEmbedded: PropTypes.bool
    };

    static defaultProps = {
        isTitleDisabled: false,
        isUndoDisabled: true,
        isRedoDisabled: true,
        isResetDisabled: true,
        isEmbedded: false
    };

    getEditorHeaderClassName() {
        return classNames({
            'adi-editor-header': true,
            'without-dataset-picker': !this.props.isTitleDisabled
        });
    }

    getApplicationTitle() {
        return this.props.isTitleDisabled ? null : <h1 className="s-adi-application-title"></h1>;
    }

    renderUnsavedChangesLabel() {
        return this.props.isSaveDisabled ? null : <div className="unsaved-notification">{t('unsaved_changes')}</div>;
    }

    render() {
        const {
            isUndoDisabled, onUndo,
            isRedoDisabled, onRedo,
            isResetDisabled, onResetReport,
            isReportSaved,
            isEmbedded
        } = this.props;

        return (
            <div className={this.getEditorHeaderClassName()}>
                {this.getApplicationTitle()}
                <div className="left-actions-wrapper">
                    <ReportTitle />
                    {this.renderUnsavedChangesLabel()}
                </div>
                <div className="export-wrapper">
                    <div className="gd-button-group">
                        <BubbleHoverTrigger>
                            <Button
                                className="button-secondary button-icon-only icon-undo undo s-undo"
                                value=""
                                disabled={isUndoDisabled}
                                onClick={onUndo}
                            />
                            <Bubble
                                className="bubble-primary"
                                alignPoints={[{ align: 'bc tc', offset: { x: 0, y: 12 } }]}
                            >
                                {t('undo')}
                            </Bubble>
                        </BubbleHoverTrigger>
                        <BubbleHoverTrigger>
                            <Button
                                className="button-secondary button-icon-only icon-redo redo s-redo"
                                value=""
                                disabled={isRedoDisabled}
                                onClick={onRedo}
                            />
                            <Bubble
                                className="bubble-primary"
                                alignPoints={[{ align: 'bc tc', offset: { x: 0, y: 12 } }]}
                            >
                                {t('redo')}
                            </Bubble>
                        </BubbleHoverTrigger>
                    </div>
                    <Button
                        value={t('reset')}
                        className="button-secondary reset s-reset-report"
                        disabled={isResetDisabled}
                        onClick={onResetReport}
                    />
                    <VisualizationsDropdown />
                    {isReportSaved ? <SaveAsNewReportButton /> : null}
                    <SaveReportButton />
                    {!isEmbedded ? <ExportButton /> : null}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        onUndo() {
            dispatch(undo());
        },
        onRedo() {
            dispatch(redo());
        },
        onResetReport() {
            dispatch(AppContextActions.resetApplication());
        }
    };
}

export default connect(editorHeaderSelector, mapDispatchToProps)(EditorHeader);

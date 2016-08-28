import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Button from 'Button/ReactButton';
import Bubble from 'Bubble/ReactBubble';
import BubbleHoverTrigger from 'Bubble/ReactBubbleHoverTrigger';
import exportButtonSelector from '../../selectors/export_button_selector';
import { t } from '../../utils/translations';
import { exportReport } from '../../actions/report_actions';

export class ExportButton extends Component {
    static propTypes = {
        onExport: PropTypes.func.isRequired,
        isExportDisabled: PropTypes.bool,
        duplicatedObject: PropTypes.object
    };

    static defaultProps = {
        isExportDisabled: false,
        duplicatedObject: null
    };

    getUnsupportedMessage(duplicatedObject) {
        const title = duplicatedObject.get('title');
        const type = duplicatedObject.get('type');
        return t('export_unsupported', { title, type: t(`bucket_item_types.${type}`) });
    }

    renderButton() {
        const { isExportDisabled, duplicatedObject, onExport } = this.props;
        return (
            <Button
                className="button-secondary export-to-report s-export-to-report"
                value={t('open_as_report')}
                disabled={isExportDisabled || !!duplicatedObject}
                onClick={onExport}
            />
        );
    }

    render() {
        const duplicatedObject = this.props.duplicatedObject;
        if (duplicatedObject) {
            return (
                <BubbleHoverTrigger>
                    {this.renderButton()}
                    <Bubble
                        className="bubble-primary"
                        alignPoints={[{ align: 'bc tr' }]}
                    >
                        {this.getUnsupportedMessage(duplicatedObject)}
                    </Bubble>
                </BubbleHoverTrigger>
            );
        }

        return this.renderButton();
    }
}

function mapDispatchToProps(dispatch) {
    return {
        onExport() {
            dispatch(exportReport());
        }
    };
}

export default connect(exportButtonSelector, mapDispatchToProps)(ExportButton);

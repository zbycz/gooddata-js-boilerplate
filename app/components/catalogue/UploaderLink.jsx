import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import Bubble from 'Bubble/ReactBubble';
import BubbleHoverTrigger from 'Bubble/ReactBubbleHoverTrigger';

export default function UploaderLink({ href }) {
    return (
        <div className="csv-link-section">
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <a
                    className="button button-link icon-plus s-btn-add_data"
                    href={href}
                    target="_blank"
                >
                    <FormattedMessage id="csv_uploader.add_data_link" />
                </a>

                <Bubble
                    className="bubble-primary"
                    alignPoints={[{ align: 'cr bl' }]}
                >
                    <FormattedMessage id="csv_uploader.add_data_title.upload" />
                    <br />
                    <FormattedMessage id="csv_uploader.add_data_title.analyze" />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}

UploaderLink.propTypes = {
    href: PropTypes.string.isRequired
};

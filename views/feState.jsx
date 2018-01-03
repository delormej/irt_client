'use babel';

import React from 'react';

export default class FeState extends React.Component {
    constructor(props) {
        super(props);
    }

    // Formats the fitness equipment state field into a user string.
    formatFeState(feState) {
        var value = "";
        switch (feState) {
            case 1: /*FE_ASLEEP_OFF*/
                value = "Off";
                break;
            case 2: /*FE_READY*/
                value = "Ready";
                break;
            case 3: /*FE_IN_USE*/
                value = "In use"
                break;
            case 4: /*FE_FINISHED_PAUSED*/
                value = "Finished or Paused.";
                break;
            default:
                value = "Not set.";
                break;
        }
        return value;
    }

    render() {
        return (
            <div className="feState">{this.formatFeState(this.props.value)}</div>
        );
    };
}

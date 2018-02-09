'use babel';

import React from 'react';

export default class TargetPowerStatus extends React.Component {
    constructor(props) {
        super(props);
    }

    formatTargetPowerStatus(status) {
        var value = "";
        switch (status) {
            case 0: /*TARGET_AT_POWER*/
                value = "On Target";
                break;
            case 1: /*TARGET_SPEED_TOO_LOW*/
                value = "Too Slow";
                break;
            case 2: /*TARGET_SPEED_TOO_HIGH*/
                value = "Too Fast";
                break;
            default:
                value = "Target not set.";
                break;
        }
        return value;
    }

    render() {
        return (
            <div className="targetPowerStatus">
                { this.props.value >= 1 && this.props.value <= 2 && 
                    this.formatTargetPowerStatus(this.props.value)
                }
            </div>
        );
    }
}


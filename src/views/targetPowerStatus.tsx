import * as React from 'react';

interface TargetPowerStatusProps {
    targetPowerLimits: number;    
}

export default class TargetPowerStatus extends React.Component<TargetPowerStatusProps> {
    constructor(props) {
        super(props);
    }

    formatTargetPowerStatus(status): string {
        var value = "";
        switch (status) {
            case 0: /*TARGET_AT_POWER*/
                value = ""; // "On Target";
                break;
            case 1: /*TARGET_SPEED_TOO_LOW*/
                value = "Too Slow";
                break;
            case 2: /*TARGET_SPEED_TOO_HIGH*/
                value = "Too Fast";
                break;
            default:
                value = "";
                break;
        }
        return value;
    }

    render(): JSX.Element {
        let className: string = "targetPowerStatus";
        if (this.props.targetPowerLimits > 0)
            className += " outsideTargetLimit";

        return (
            <div className={className}>
                {this.formatTargetPowerStatus(this.props.targetPowerLimits)}
            </div>
        );
    }
}


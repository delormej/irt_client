import * as React from 'react';
import RideDataComponent from  './rideDataComponent';
import ColorStyle from '../lib/ant/ts/colorScale';

export interface PowerMeterProps {
    message?: string;
    CalculatedPower?: number;
    CalculatedCadence?: number;
    ftp: number;
}

export default class PowerMeter extends React.Component<PowerMeterProps> {
    usingCtf: boolean = false;

    constructor(props: PowerMeterProps) {
      super(props);
    }

    render(): JSX.Element {
        let power: string;
        this.usingCtf = (this.props.message === 'ctfMainPage');
        if (this.props.CalculatedPower == undefined)
            power = "0";
        else 
            power = this.props.CalculatedPower.toString();
        return (
            <RideDataComponent class="bikePower" label="WATTS"
                style={ColorStyle.getColorStyle(this.props.CalculatedPower, this.props.ftp)}
                value={power} />
            );      
    }
}  

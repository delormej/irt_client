import * as React from 'react';
import RideDataComponent from  './rideDataComponent';
import ColorStyle from '../lib/ant/ts/colorScale';

export interface PowerMeterProps {
    message: string;
    instantPower: number;
    instantCadence: number;
    ftp: number;
}

export default class PowerMeter extends React.Component<PowerMeterProps> {
    usingCtf: boolean = false;

    constructor(props: PowerMeterProps) {
      super(props);
    }

    render(): JSX.Element {
        let power: string;
        if (this.props.message === 'ctfMainPage')
            this.usingCtf = true;
        if (this.props.instantPower == undefined)
            power = "0";
        else 
            power = this.props.instantPower.toString();
        return (
            <RideDataComponent class="bikePower" label="WATTS"
                style={ColorStyle.getColorStyle(this.props.instantPower, this.props.ftp)}
                value={power} />
            );      
    }
}  

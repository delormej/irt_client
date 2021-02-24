import * as React from 'react';
import RideDataComponent from  './rideDataComponent';
import ColorStyle from '../lib/ant/ts/colorScale';

export default class PowerMeter extends React.Component {
    usingCtf = false;

    constructor(props) {
      super(props);
    }

    render() {
        let power = "0";

        if (this.props.Power)
            power = this.props.Power.toString();
        // else if (this.props.Power)
        //     power = this.props.Power.toString();

        // this.usingCtf = (this.props.message === 'ctfMainPage');
        // if (this.props.CalculatedPower == undefined)
        //     power = "0";
        // else 
        //     power = this.props.CalculatedPower.toString();
        return (
            <RideDataComponent class="bikePower" label="WATTS"
                style={ColorStyle.getColorStyle(0, this.props.ftp)}
                value={power} />
            );      
    }
}  

import * as React from 'react';
import RideDataComponent from  './rideDataComponent';
import ColorStyle from '../lib/ant/ts/colorScale';

export default class PowerMeter extends React.Component {

    constructor(props) {
      super(props);
    }

    render() {
        let power = "0";

        if (this.props.Power) {
            console.log("power==" + this.props.Power);
            power = this.props.Power.toString();
        }

        return (
            <RideDataComponent class="bikePower" label="WATTS"
                style={ColorStyle.getColorStyle(0, this.props.ftp)}
                value={power} />
            );      
    }
}  
'use babel';

import React from 'react';
import RideDataComponent from '../views/rideDataComponent.jsx';
import ColorStyle from '../lib/ant/ts/colorScale';

export default class PowerMeter extends React.Component {
    constructor(props) {
      super(props);
      this.bp = this.props.bp;
      this.onBikePower = this.onBikePower.bind(this);
      this.state = {
          instantPower: 0,
          instantCadence: 0
      };
    }

    onBikePower(data, timestamp) {
        this.setState( {
            instantPower: data.instantPower,
            instantCadence: data.instantCadence
        });
    }

    componentDidMount() {
        this.bp.on('standardPowerOnly', this.onBikePower);
        this.bp.on('ctfMainPage', this.onBikePower);
    }

    componentWillUnmount() {
        this.bp.removeListener('standardPowerOnly', this.onBikePower);
        this.bp.removeListener('ctfMainPage', this.onBikePower);
    }

    render() {
        return (
            <RideDataComponent class="bikePower" label="WATTS"
                style={ColorStyle.getColorStyle(this.state.instantPower, this.props.ftp)}
                value={this.state.instantPower} />
          );      
    }
}  

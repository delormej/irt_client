'use babel';

import React from 'react';
import RideDataComponent from './rideDataComponent';

export default class Cadence extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
        return (
            <RideDataComponent class="cadence" label="RPM"
                value={this.props.Cadence} />
          );      
    }
}  

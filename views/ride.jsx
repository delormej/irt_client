'use babel';

import React from 'react';
import GeneralFEData from '../views/generalFEData.jsx';
import SpecificTrainerData from '../views/specificTrainerData.jsx';

export default class Ride extends React.Component {
    constructor(props) {
      super(props);
      this.fec = this.props.ant.fec;
      this.bp = this.props.ant.bp;
      this.bgScanner = this.props.ant.bgScanner;
    }

    render() {
        return (
            <div>
              <GeneralFEData fec={this.fec} />
              <SpecificTrainerData fec={this.fec} />
            </div>
          );      
    }
}  
  
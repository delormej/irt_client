'use babel';

import React from 'react';

export default class RideDataComponent extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
        return (
            <div className={this.props.class}>
              <div className="dataLabel">{this.props.label}</div>
              <div className="dataValue">{this.props.value}</div>
            </div>
        );      
    }
}  
  
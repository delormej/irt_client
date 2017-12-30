'use babel';
import React from 'react';
const MPS_TO_MPH = 2.23694;

export default class SpeedMph extends React.Component {
    
    constructor(props) {
        super(props);
    }

    calculateMph(mps) {
        return (mps * MPS_TO_MPH).toFixed(1);
    }

    render() {
        return (
            <div className="speed">{this.calculateMph(this.props.mps)}</div>
        );
    }
}
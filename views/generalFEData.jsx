'use babel';

import React from 'react';
import RideDataComponent from '../views/rideDataComponent.jsx';
import util from 'util';
import zpad from 'zpad';

function ElapsedTime(props) {
    // Returns a string in hh:mm:ss format from seconds.
    function formatTime(elapsedSeconds) {
        let hours = Math.floor(elapsedSeconds / 3600);       
        let minutes = Math.floor( ((elapsedSeconds - (hours * 3600)) / 60) );
        let seconds =  Math.floor(elapsedSeconds - ((hours * 3600) + (minutes * 60))); 
        return util.format('%s:%s:%s', 
            zpad(hours,2), 
            zpad(minutes, 2),
            zpad(seconds,2));
    }   
    return (
        <RideDataComponent class="duration" label="DURATION"
            value={formatTime(props.elapsedSeconds)} />
    );
}

export default class GeneralFEData extends React.Component {
    constructor(props) {
        super(props);
        this.fec = props.fec;
        this.state = {
            speedMps: 0,
            distanceTravelled: 0,
            elapsedTime: 0,
            distanceTravelledEnabled: false,
            fecState: 0
        }
        this.onGeneralFEData = this.onGeneralFEData.bind(this);
    }
    
    onGeneralFEData(data, timestamp) {
        this.setState({
            speedMps: data.speedMps,
            distanceTravelled: data.distanceTravelled,
            elapsedTime: data.elapsedTime,
            distanceTravelledEnabled: data.distanceTravelledEnabled,
            fecState: data.state
        });
    }

    componentDidMount() {
        this.fec.on('generalFEData', this.onGeneralFEData);
    }

    componentWillUnmount() {
        this.fec.removeListener('generalFEData', this.onGeneralFEData);
    }

    render() {
        return (
            <div>
                <ElapsedTime elapsedSeconds={this.state.elapsedTime} />
            </div>
        );
    }
}

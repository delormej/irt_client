import * as React from 'react';
import RideDataComponent from './rideDataComponent';
import * as util from 'util';

interface ElapsedTimeProps {
    ElapsedTime: number;
}

export default class ElapsedTime extends React.Component<ElapsedTimeProps> {
    constructor(props) {
      super(props);
    }

    // Returns a string in hh:mm:ss format from seconds.
    formatTime(elapsedSeconds): string {
        let hours = Math.floor(elapsedSeconds / 3600);       
        let minutes = Math.floor( ((elapsedSeconds - (hours * 3600)) / 60) );
        let seconds =  Math.floor(elapsedSeconds - ((hours * 3600) + (minutes * 60))); 
        return util.format('%s:%s:%s', 
            hours.toString().padStart(2, "0"),
            minutes.toString().padStart(2, "0"),
            seconds.toString().padStart(2, "0"));
    }   

    render(): JSX.Element {
        return (
            <RideDataComponent class="duration" label="DURATION"
                value={this.formatTime(this.props.ElapsedTime)} />
        );
    }
}    

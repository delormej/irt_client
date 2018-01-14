'use babel';

import React from 'react';

export default class GeneralSettings extends React.Component {
    constructor(props) {
        super(props);
        this.fec = props.fec;
        this.state = {
            wheelCircumference: 0,
            resistanceLevel: 0,     
            state: 0
        }
        this.onGeneralSettings = this.onGeneralSettings.bind(this);
    }
    
    onGeneralSettings(data, timestamp) {
        this.setState({
            wheelCircumference : data.wheelCircumference,
            resistanceLevel : data.resistanceLevel,     
            state : data.state
        });
    }

    componentDidMount() {
        this.fec.on('generalSettings', this.onGeneralSettings);
    }

    componentWillUnmount() {
        this.fec.removeListener('generalSettings', this.onGeneralSettings);
    }
}

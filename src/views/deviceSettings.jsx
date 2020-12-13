'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';

export default class DeviceSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deviceId: props.deviceId
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event, object) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        object.setState({
            [name]: value
        });
    }
}
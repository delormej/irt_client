'use babel';

import React from 'react';
import deviceType from '../scripts/deviceType.js';
import { AntContext } from '../lib/ant/antProvider';


export class AvailableDevice extends React.Component {

    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);

        this.state = {
            deviceId: props.deviceInfo.deviceId,
            manufacturerName: props.deviceInfo.manufacturerName,
            selected: false
        };
    }

    onClick() {
        const selected = !this.state.selected;
        this.setState({
            selected: selected
        });
        
        if (selected) {
            this.props.onClick(this.state.deviceId);
        }
    }

    render() {
        return (
            <div className="deviceInfo" 
                onClick={this.onClick}>
                {this.state.manufacturerName}: {this.state.deviceId}<br/>
                <button>{this.state.selected ? "Deselect" : "Select"}</button>
            </div>
        );
    }
}

export default class AvailableDevices extends React.Component {

    constructor(props) {
        super(props);

        this.selectedDeviceId = null;
        this.onConnectDevice = props.onConnectDevice;
        this.deviceType = props.deviceType;
        this.onDeviceInfo = this.onDeviceInfo.bind(this);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    onSelectDevice(deviceId) {
        console.log('connecting to device...');
        // this.scanner.detach();
        this.selectedDeviceId = deviceId;
        this.onConnectDevice(this.deviceType, this.selectedDeviceId);
    }

    render() {
        const listItems = this.props.availableDevices.map((deviceInfo) =>
            <AvailableDevice key={deviceInfo.deviceId} deviceInfo={deviceInfo} 
                onClick={(deviceId) => this.onSelectDevice(deviceId)}/>);
        let className = "availableDevices " + deviceType.getDeviceClassName(this.deviceType);
        return (
            <div className={className}>
                <div className="deviceTitle">Select {deviceType.getDeviceTypeName(this.deviceType)}</div>
                {listItems.length > 0 ? ( 
                    <div>
                        {listItems}
                    </div>
                ) : (<div>Searching for devices...</div>)}
            </div>
        );      
    }
}

AvailableDevices.contextType = AntContext;
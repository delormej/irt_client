import * as React from 'react';
import { AntContext } from '../lib/ant/antProvider';

export default class AntDevicesConnectedStatus extends React.Component {
    // feState: number = 0;
    // powerMeterConnected: boolean = false;
    
    constructor(props) {
      super(props);
    }

    render() {
        // if (this.props.message === 'specificTrainerData' && this.props.state != null) 
        //     this.feState = this.props.state.feState;
        // if (this.props.message === 'irtExtraInfo') 
        //     this.powerMeterConnected = this.props.powerMeterConnected;

        return (
            <React.Fragment>
                <FecConnectedStatus isConnected={this.context.fecConnected} />
                <BpConnectedStatus isConnected={this.context.bpConnected} /> 
                <DeviceConnectedStatus deviceType="hrm" 
                    isConnected={this.context.hrmConnected} />
            </React.Fragment>
        );
    }
}

function getConnectedStatusClass(className, connected) {
    if (connected) {
      return className + " connectedStatus";
    }
    else {
      return className + " notConnectedStatus";
    }
}

function FecConnectedStatus(props) {
    return (
        <DeviceConnectedStatus deviceType='fec' 
            isConnected={props.isConnected} status={props.feState} />
    );
}
  
function BpConnectedStatus(props) {
    let status = null;
    if (props.powerMeterConnected)
        status = 'Paired to FE-C';
    return (<DeviceConnectedStatus deviceType='bp' {...props} status={status} />);
}

function DeviceConnectedStatus(props) {
    let className = props.deviceType + "ConnectedStatus";
    let deviceTypeName;
    if (props.deviceType === "fec") {
      deviceTypeName = "FE-C";
    }
    else if (props.deviceType === "bp") {
      deviceTypeName = "PWR";
    }
    else if (props.deviceType === "hrm") {
        deviceTypeName = "HRM";
    }
    let status = props.status;
    if (status == null) {
        if (props.isConnected)
            status = "Connected";
        else 
            status = "Not Connected";
    }
    return (
      <div className={getConnectedStatusClass(className, props.isConnected)}>
        <b>{deviceTypeName}&nbsp;</b>{status}
      </div>
      );
}

AntDevicesConnectedStatus.contextType = AntContext;
  
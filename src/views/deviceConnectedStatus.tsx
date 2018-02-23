import * as React from 'react';

interface ConnectedStatusProps {
    bpConnected: Boolean;
    bpIsConnectedToFec: Boolean;
    hrmConnected: Boolean;
    fecConnected: Boolean;
    feState: Number;
}

interface ConnectedStatusState {
    feState: Number;
    powerMeterConnected: Boolean;
}

export default class AntDevicesConnectedStatus extends React.Component<ConnectedStatusProps, ConnectedStatusState> {
    constructor(props) {
      super(props);
      this.state = {
          feState: 0,
          powerMeterConnected: false
      }
    }

    render(): JSX.Element {
        return (
            <React.Fragment>
                <FecConnectedStatus isConnected={this.props.fecConnected} feState={this.state.feState} />
                <BpConnectedStatus isConnected={this.props.bpConnected} powerMeterConnected={this.state.powerMeterConnected} />
                <DeviceConnectedStatus deviceType="hrm" isConnected={this.props.hrmConnected} />
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

function getFeStatus(feState: Number): String {
    if (feState > 0)
        return "In Use";
    else    
        return null;
}

function FecConnectedStatus(props) {
    let status: String = getFeStatus(props.feState);
    return (<DeviceConnectedStatus deviceType='fec' isConnected={props.isConnected} status={status} />);
}
  
function BpConnectedStatus(props) {
    let status: String = null;
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
  
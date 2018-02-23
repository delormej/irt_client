import * as React from 'react';

interface CapabilitiesState {
    virtualSpeed: boolean;
    feState: number;
    lapToggle: boolean; 
}

interface ConnectedStatusProps {
    bpConnected: boolean;
    bpIsConnectedToFec: boolean;
    hrmConnected: boolean;
    fecConnected: boolean;
    state: CapabilitiesState;
    powerMeterConnected: boolean;
    message?:string;
}

export default class AntDevicesConnectedStatus extends React.Component<ConnectedStatusProps> {
    feState: number = 0;
    powerMeterConnected: boolean = false;
    constructor(props) {
      super(props);
    }

    render(): JSX.Element {
        if (this.props.message === 'specificTrainerData' && this.props.state != null) 
            this.feState = this.props.state.feState;
        if (this.props.message === 'irtExtraInfo') 
            this.powerMeterConnected = this.props.powerMeterConnected;

        return (
            <React.Fragment>
                <FecConnectedStatus isConnected={this.props.fecConnected} feState={this.feState} />
                <BpConnectedStatus isConnected={this.props.bpConnected} powerMeterConnected={this.powerMeterConnected} />
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

function getFeStatus(feState: number): string {
    let value: string = null;
    switch (feState) {
        case 1: /*FE_ASLEEP_OFF*/
            value = "Off";
            break;
        case 2: /*FE_READY*/
            value = "Ready";
            break;
        case 3: /*FE_IN_USE*/
            value = "In use"
            break;
        case 4: /*FE_FINISHED_PAUSED*/
            value = "Finished or Paused.";
            break;
        default:
            break;
    }
    return value;
}

function FecConnectedStatus(props): JSX.Element {
    let status: string;
    if (props.isConnected)
        status = getFeStatus(props.feState);
    return (<DeviceConnectedStatus deviceType='fec' isConnected={props.isConnected} status={status} />);
}
  
function BpConnectedStatus(props): JSX.Element {
    let status: string = null;
    if (props.powerMeterConnected)
        status = 'Paired to FE-C';
    return (<DeviceConnectedStatus deviceType='bp' {...props} status={status} />);
}

function DeviceConnectedStatus(props): JSX.Element {
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
  
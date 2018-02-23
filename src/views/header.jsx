'use babel';

import React from 'react';
import VersionInfo from '../views/versionInfo.jsx';
import SpecificTrainerData from '../views/specificTrainerData.jsx';

function getConnectedStatusClass(className, connected) {
  if (connected) {
    return className + " connectedStatus";
  }
  else {
    return className + " notConnectedStatus";
  }
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
  return (
    <div className={getConnectedStatusClass(className, props.isConnected)}>
      <b>{deviceTypeName}&nbsp;</b>{props.isConnected ? "Connected" : "Not Connected"}
    </div>
    );
}

function Menu(props) {
    let navigatePage;
    let linkLabel;
    if (props.page === "settings") {
      navigatePage = "ride";
      linkLabel = "RIDE";
    }
    else if (props.page === "ride") {
      navigatePage = "settings";
      linkLabel = "SETUP";
    }
    else 
      return null; // don't try to show menu in an error condition.
    return (
      <div className="menu">
        <a href="#" className="menuLink" onClick={() => props.onClick(navigatePage)}>{linkLabel}</a>
        <DeviceConnectedStatus deviceType="fec" isConnected={props.fecConnected} />
        <DeviceConnectedStatus deviceType="bp" isConnected={props.bpConnected} />
      </div>
    );
}

function Status(props) {
  let className = "status";
  if (props.type === "error")
    className += " error";
  return (
    <div className={className}>
      <span>{props.message}</span>
      {props.fec && <SpecificTrainerData fec={props.fec} />}
    </div>
  );
}

export default class Header extends React.Component {
    constructor(props) {
      super(props);
    }    
    
    render() {
      return (
          <div className="header">
              <img className="logo" src="./images/logo.png" />
              <VersionInfo />
              <Status type={this.props.status.type} message={this.props.status.message}
                fec={this.props.fec} />
              <Menu page={this.props.page} onClick={this.props.onClick} 
                  fecConnected={this.props.fecConnected}
                  bpConnected={this.props.bpConnected} />;
          </div>
      );
  }
}

'use babel';

import React from 'react';
import VersionInfo from './versionInfo.jsx';
import SpecificTrainerData from './specificTrainerData.jsx';
import AntDevicesConnectedStatus from './deviceConnectedStatus';
import { hocAntMessage } from '../containers/hocAntMessage';

const DevicesConnectedFromAnt = hocAntMessage(['specificTrainerData', 'irtExtraInfo'])(AntDevicesConnectedStatus);

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
        <DevicesConnectedFromAnt ant={props.ant} fecConnected={props.fecConnected} 
          bpConnected={props.bpConnected} hrmConnected={props.hrmConnected} />
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
                  ant={this.props.fec}
                  fecConnected={this.props.fecConnected}
                  bpConnected={this.props.bpConnected}
                  hrmConnected={this.props.hrmConnected} />;
          </div>
      );
  }
}

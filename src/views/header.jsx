'use babel';

import React from 'react';
import VersionInfo from '../views/versionInfo.jsx';

function getConnectedStatusClass(className, connected) {
  if (connected) {
    return className + " connectedStatus";
  }
  else {
    return className + " notConnectedStatus";
  }
}

function Menu(props) {
    let navigatePage;
    let linkLabel;
    if (props.page === "settings") {
      navigatePage = "ride";
      linkLabel = "RIDE";
    }
    else {
      navigatePage = "settings";
      linkLabel = "SETUP";
    }
    return (
      <div className="menu">
        <a href="#" className="menuLink" onClick={() => props.onClick(navigatePage)}>{linkLabel}</a>
        <div className={getConnectedStatusClass("fecConnectedStatus", props.fecConnected)}><b>FE-C&nbsp;</b>{props.fecConnected ? "Connected" : "Not Connected"}</div>
        <div className={getConnectedStatusClass("bpConnectedStatus", props.bpConnected)}><b>PWR&nbsp;</b>{props.bpConnected ? "Connected" : "Not Connected"}</div>
        <img src="./images/close.png" id="closeBtn" />
      </div>
    );
}

function Status(props) {
  let className = "status";
  if (props.type === "error")
    className += " error";
  return (
    <div className={className}>{props.message}</div>
  );
}

export default class Header extends React.Component {
    constructor(props) {
      super(props);
    }    
    
    render() {
      let menu = null;
      if (this.props.page)
        menu = <Menu page={this.props.page} onClick={this.props.onClick} 
                  fecConnected={this.props.fecConnected}
                  bpConnected={this.props.bpConnected} />;
      return (
          <div className="header">
              <img className="logo" src="./images/logo.png" />
              <VersionInfo />
              <Status type={this.props.status.type} message={this.props.status.message} />
              {menu}
          </div>
      );
  }
}
